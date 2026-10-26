import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProfile,
  PlayerCustomization,
  GameSettings,
  FriendEntry,
  getXpRequiredForLevel,
  calculateStageWonXp,
} from '../types/game';

// Initialize Firebase with provisioned config
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Firestore connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration.');
    }
  }
}
testConnection();

const LOCAL_STORAGE_KEY = 'together_adventures_2d_profile';

const DEFAULT_CUSTOMIZATION: PlayerCustomization = {
  name: 'Aventureiro',
  color: '#3b82f6',
  secondaryColor: '#93c5fd',
  hat: 'cap',
  face: 'happy',
};

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.7,
  showTouchControls: true,
  touchControlsScale: 1.0,
  touchControlsOpacity: 0.85,
  haptics: true,
  graphicsQuality: 'high',
  botCompanion: true,
  screenOrientation: 'auto',
};

export class AuthService {
  private currentProfile: UserProfile;
  private listeners: ((profile: UserProfile) => void)[] = [];
  public isFirebaseReady: boolean = true;
  public firebaseError: string | null = null;

  constructor() {
    this.currentProfile = this.loadLocalProfile();
    this.initAuthListener();
    setTimeout(() => this.registerWithServer(), 200);
  }

  private generateFriendCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = 'TOG-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private loadLocalProfile(): UserProfile {
    try {
      const lastUid = localStorage.getItem('together_last_logged_uid');
      const userSpecificStored = lastUid ? localStorage.getItem(`together_profile_${lastUid}`) : null;
      const stored = userSpecificStored || localStorage.getItem(LOCAL_STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          level: parsed.level ?? 1,
          xp: parsed.xp ?? 0,
          totalXp: parsed.totalXp ?? 0,
          isGuest: parsed.isGuest ?? (parsed.email ? false : true),
          coins: parsed.coins ?? 2, // Start with 2 bonus coins to try the shop
          unlockedLevels: parsed.unlockedLevels ?? Math.max(1, (parsed.stagesCompleted || 0) + 1),
          unlockedSkins: parsed.unlockedSkins ?? ['cap', 'beanie', 'crown', 'flower', 'headphones'],
          friendCode: parsed.friendCode || this.generateFriendCode(),
          friends: parsed.friends ?? [],
          customization: {
            ...DEFAULT_CUSTOMIZATION,
            ...(parsed.customization || {}),
          },
          settings: {
            ...DEFAULT_SETTINGS,
            ...(parsed.settings || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }

    const defaultProfile: UserProfile = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      displayName: 'Aventureiro',
      stagesCompleted: 0,
      unlockedLevels: 1, // Level 1 is unlocked initially
      coins: 2, // 2 free coins to enjoy shop
      level: 1, // Start at Account Level 1
      xp: 0, // 0/15 XP to Level 2
      totalXp: 0,
      isGuest: true,
      unlockedSkins: ['cap', 'beanie', 'crown', 'flower', 'headphones'],
      friendCode: this.generateFriendCode(),
      friends: [],
      totalJumps: 0,
      highFives: 0,
      createdAt: Date.now(),
      customization: { ...DEFAULT_CUSTOMIZATION },
      settings: { ...DEFAULT_SETTINGS },
    };

    this.saveLocalProfile(defaultProfile);
    return defaultProfile;
  }

  private saveLocalProfile(profile: UserProfile) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
      if (profile.uid) {
        localStorage.setItem(`together_profile_${profile.uid}`, JSON.stringify(profile));
        localStorage.setItem('together_last_logged_uid', profile.uid);
      }
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  public getProfile(): UserProfile {
    return this.currentProfile;
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.currentProfile = {
      ...this.currentProfile,
      ...updates,
      customization: {
        ...this.currentProfile.customization,
        ...(updates.customization || {}),
      },
      settings: {
        ...this.currentProfile.settings,
        ...(updates.settings || {}),
      },
    };
    this.saveLocalProfile(this.currentProfile);
    this.notify();

    // Sync to Firestore if authenticated with Google
    this.syncToFirestore();
    // Sync to server registry for real friends lookup
    this.registerWithServer();

    return this.currentProfile;
  }

  // Register user in server real-player directory
  public async registerWithServer() {
    try {
      await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: this.currentProfile.uid,
          friendCode: this.currentProfile.friendCode,
          displayName: this.currentProfile.displayName,
          color: this.currentProfile.customization.color,
          hat: this.currentProfile.customization.hat,
        }),
      });
    } catch (e) {
      // offline or silent
    }
  }

  // Search for real humans by code or display name
  public async searchRealUser(query: string): Promise<FriendEntry | null> {
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.found && data.user) {
        return {
          uid: data.user.uid,
          name: data.user.displayName,
          friendCode: data.user.friendCode,
          color: data.user.color || '#3b82f6',
          hat: data.user.hat || 'none',
          isOnline: !!data.user.isOnline,
          lastSeen: data.user.lastSeen,
        };
      }
    } catch (e) {
      console.warn('Real user search error:', e);
    }
    return null;
  }

  // Earn coins (+1 coin every stage won!)
  public addCoins(amount: number = 1): number {
    const newCoins = (this.currentProfile.coins || 0) + amount;
    this.updateProfile({ coins: newCoins });
    return newCoins;
  }

  // Buy a skin from the shop with coins
  public buySkin(skinId: string, cost: number, newCustomization?: Partial<PlayerCustomization>): boolean {
    if (this.currentProfile.coins < cost) {
      return false;
    }
    const unlocked = Array.from(new Set([...(this.currentProfile.unlockedSkins || []), skinId]));
    const updates: Partial<UserProfile> = {
      coins: this.currentProfile.coins - cost,
      unlockedSkins: unlocked,
    };
    if (newCustomization) {
      updates.customization = {
        ...this.currentProfile.customization,
        ...newCustomization,
      };
    }
    this.updateProfile(updates);
    return true;
  }

  // Add a real friend
  public addFriend(friend: FriendEntry): boolean {
    if (this.currentProfile.friends.some(f => f.uid === friend.uid || f.friendCode === friend.friendCode)) {
      return false; // already friends
    }
    const updated = [...this.currentProfile.friends, friend];
    this.updateProfile({ friends: updated });
    return true;
  }

  public removeFriend(friendCode: string) {
    const updated = this.currentProfile.friends.filter(f => f.friendCode !== friendCode);
    this.updateProfile({ friends: updated });
  }

  // Add XP and handle doubling level progression (Level 1->2: 15XP, 2->3: 30XP, 3->4: 60XP...)
  public addXp(amount: number): {
    leveledUp: boolean;
    levelsGained: number;
    newLevel: number;
    currentXp: number;
    nextLevelXp: number;
    earnedXp: number;
  } {
    let level = this.currentProfile.level || 1;
    let xp = (this.currentProfile.xp || 0) + amount;
    const totalXp = (this.currentProfile.totalXp || 0) + amount;
    let leveledUp = false;
    let levelsGained = 0;

    // Check level ups based on 15 * 2^(level - 1)
    while (xp >= getXpRequiredForLevel(level)) {
      xp -= getXpRequiredForLevel(level);
      level += 1;
      leveledUp = true;
      levelsGained += 1;
    }

    this.updateProfile({
      level,
      xp,
      totalXp,
    });

    return {
      leveledUp,
      levelsGained,
      newLevel: level,
      currentXp: xp,
      nextLevelXp: getXpRequiredForLevel(level),
      earnedXp: amount,
    };
  }

  // Record stage victory: unlocks next level, awards +1 Coin, and gains 2-5 XP + bonus per companion!
  public recordStageCompleted(
    stageIndex: number,
    playerCount: number = 1
  ): {
    coinAwarded: boolean;
    nextLevelUnlocked: boolean;
    xpEarned: number;
    baseXp: number;
    bonusXp: number;
    leveledUp: boolean;
    newLevel: number;
    currentXp: number;
    nextLevelXp: number;
  } {
    const newStagesCompleted = Math.max(this.currentProfile.stagesCompleted, stageIndex + 1);
    const newUnlockedLevels = Math.min(2000, Math.max(this.currentProfile.unlockedLevels, stageIndex + 2));
    const newCoins = (this.currentProfile.coins || 0) + 1; // +1 coin won per stage!

    const coinAwarded = true;
    const nextLevelUnlocked = newUnlockedLevels > this.currentProfile.unlockedLevels;

    // Calculate XP: 2 to 5 XP + party bonus proportional to companion count!
    const { baseXp, bonusXp, totalXp } = calculateStageWonXp(playerCount);
    const xpResult = this.addXp(totalXp);

    this.updateProfile({
      stagesCompleted: newStagesCompleted,
      unlockedLevels: newUnlockedLevels,
      coins: newCoins,
    });

    return {
      coinAwarded,
      nextLevelUnlocked,
      xpEarned: totalXp,
      baseXp,
      bonusXp,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel,
      currentXp: xpResult.currentXp,
      nextLevelXp: xpResult.nextLevelXp,
    };
  }

  public incrementJumps() {
    this.currentProfile.totalJumps++;
    this.saveLocalProfile(this.currentProfile);
  }

  public subscribe(cb: (profile: UserProfile) => void): () => void {
    this.listeners.push(cb);
    cb(this.currentProfile);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    for (const cb of this.listeners) {
      cb(this.currentProfile);
    }
  }

  private initAuthListener() {
    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Load the existing Google account from Firestore so it always returns to the exact same account
        await this.loadFromFirestore(user.uid);
      }
    });
  }

  private async loadFromFirestore(uid: string) {
    const path = `users/${uid}`;
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        // EXACT EXISTING ACCOUNT FOUND! Restore everything completely without creating or resetting anything
        const data = snap.data();
        this.currentProfile = {
          uid,
          displayName: data.displayName || auth.currentUser?.displayName || 'Jogador Google',
          email: auth.currentUser?.email || data.email,
          photoURL: auth.currentUser?.photoURL || data.photoURL,
          isGuest: false,
          level: data.level ?? 1,
          xp: data.xp ?? 0,
          totalXp: data.totalXp ?? 0,
          stagesCompleted: data.stagesCompleted ?? 0,
          unlockedLevels: data.unlockedLevels ?? 1,
          coins: data.coins ?? 2,
          unlockedSkins: data.unlockedSkins || ['cap', 'beanie', 'crown', 'flower', 'headphones'],
          friendCode: data.friendCode || this.generateFriendCode(),
          friends: data.friends || [],
          totalJumps: data.totalJumps ?? 0,
          highFives: data.highFives ?? 0,
          createdAt: data.createdAt || Date.now(),
          customization: {
            ...DEFAULT_CUSTOMIZATION,
            ...(data.customization || {}),
          },
          settings: {
            ...DEFAULT_SETTINGS,
            ...(data.settings || {}),
          },
        };
        this.saveLocalProfile(this.currentProfile);
        this.notify();
        this.registerWithServer();
      } else {
        // Truly first time this Google account has logged in
        this.currentProfile.uid = uid;
        this.currentProfile.displayName = auth.currentUser?.displayName || this.currentProfile.displayName || 'Jogador Google';
        this.currentProfile.email = auth.currentUser?.email || undefined;
        this.currentProfile.photoURL = auth.currentUser?.photoURL || undefined;
        this.currentProfile.isGuest = false;
        this.saveLocalProfile(this.currentProfile);
        this.notify();
        await this.syncToFirestore();
        this.registerWithServer();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
        handleFirestoreError(err, OperationType.GET, path);
      } else {
        console.warn('Could not read from Firestore:', err);
      }
    }
  }

  private async syncToFirestore() {
    if (!this.currentProfile.email || !auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}`;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        displayName: this.currentProfile.displayName,
        email: this.currentProfile.email,
        level: this.currentProfile.level || 1,
        xp: this.currentProfile.xp || 0,
        totalXp: this.currentProfile.totalXp || 0,
        stagesCompleted: this.currentProfile.stagesCompleted,
        unlockedLevels: this.currentProfile.unlockedLevels,
        coins: this.currentProfile.coins,
        unlockedSkins: this.currentProfile.unlockedSkins,
        friendCode: this.currentProfile.friendCode,
        friends: this.currentProfile.friends,
        totalJumps: this.currentProfile.totalJumps,
        highFives: this.currentProfile.highFives,
        customization: this.currentProfile.customization,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
        handleFirestoreError(err, OperationType.WRITE, path);
      } else {
        console.warn('Could not write to Firestore:', err);
      }
    }
  }

  public async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const res = await signInWithPopup(auth, provider);
      const user = res.user;

      // Restore existing Google account data from Firestore without overwriting!
      await this.loadFromFirestore(user.uid);

      try {
        localStorage.setItem('together_logged_in', 'true');
        localStorage.setItem('together_has_selected_avatar', 'true');
        localStorage.setItem('together_last_logged_uid', user.uid);
        localStorage.removeItem('together_is_guest');
      } catch (e) {
        console.warn(e);
      }

      return { success: true };
    } catch (err: unknown) {
      console.error('Google Sign-In error:', err);
      const msg = err instanceof Error ? err.message : String(err);

      if (msg.includes('popup-blocked')) {
        return { success: false, error: 'O pop-up de login foi bloqueado pelo navegador. Permita pop-ups para este site e tente novamente.' };
      }
      if (msg.includes('unauthorized-domain')) {
        return { success: false, error: 'Domínio não autorizado no Firebase Console. Adicione o domínio deste applet na lista de Authorized Domains no Firebase Authentication.' };
      }
      return { success: false, error: `Erro no login Google: ${msg}` };
    }
  }

  // Entrar como convidado
  public signInAsGuest(customName?: string): { success: boolean } {
    const guestNumber = Math.floor(1000 + Math.random() * 9000);
    const displayName = customName?.trim() || this.currentProfile.displayName || `Convidado #${guestNumber}`;
    this.currentProfile = {
      ...this.currentProfile,
      displayName,
      isGuest: true,
      customization: {
        ...this.currentProfile.customization,
        name: displayName,
      },
    };
    try {
      localStorage.setItem('together_logged_in', 'true');
      localStorage.setItem('together_has_selected_avatar', 'true');
      localStorage.setItem('together_is_guest', 'true');
      localStorage.setItem('together_last_logged_uid', this.currentProfile.uid);
    } catch (e) {
      console.warn(e);
    }
    this.saveLocalProfile(this.currentProfile);
    this.notify();
    this.registerWithServer();
    return { success: true };
  }

  public async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error', e);
    }

    try {
      localStorage.removeItem('together_logged_in');
      localStorage.removeItem('together_last_logged_uid');
    } catch (e) {
      console.warn(e);
    }

    const defaultProfile: UserProfile = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      displayName: 'Aventureiro',
      stagesCompleted: 0,
      unlockedLevels: 1,
      coins: 2,
      level: 1,
      xp: 0,
      totalXp: 0,
      isGuest: true,
      unlockedSkins: ['cap', 'beanie', 'crown', 'flower', 'headphones'],
      friendCode: this.generateFriendCode(),
      friends: [],
      totalJumps: 0,
      highFives: 0,
      createdAt: Date.now(),
      customization: { ...DEFAULT_CUSTOMIZATION },
      settings: { ...DEFAULT_SETTINGS },
    };

    this.currentProfile = defaultProfile;
    this.saveLocalProfile(this.currentProfile);
    this.notify();
  }
}

export const authService = new AuthService();
