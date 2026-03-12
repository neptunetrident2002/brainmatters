// ─── taskqueue.ts ─────────────────────────────────────────────────────────────
//
// Queue management for BrainMatters challenges.
//
// Rules:
//   - Always 3 challenges in queue
//   - Slot 0 & 1 → user's 2 primary domains (from onboarding profile)
//   - Slot 2 → variety domain (different from both primary domains)
//   - Complete any challenge → that slot auto-fills with same domain rule
//   - Replace any challenge → custom LLM-generated task in that slot
//   - Seen tasks tracked per domain in ss_seen_{domain} to prevent repeats
//   - When all tasks in a domain+tier are seen → reset that domain's seen list
//
// localStorage keys:
//   ss_queue_domains   — [primary, secondary] domains for this user
//   ss_seen_{domain}   — array of task IDs seen in that domain

import { TASK_BANK, inferDomains, getVarietyDomain, type BankTask, type TaskDomain, type TaskTier } from "@/lib/data/taskbank";
import { loadProfile, getDifficultyTier } from "@/lib/utils/taskgen";

// ─── Seen task tracking ───────────────────────────────────────────────────────

function getSeenIds(domain: TaskDomain): Set<string> {
  try {
    const raw = localStorage.getItem(`ss_seen_${domain}`);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function markSeen(domain: TaskDomain, id: string) {
  const seen = getSeenIds(domain);
  seen.add(id);
  localStorage.setItem(`ss_seen_${domain}`, JSON.stringify(Array.from(seen)));
}

function resetSeen(domain: TaskDomain) {
  localStorage.removeItem(`ss_seen_${domain}`);
}

// ─── Domain resolution ────────────────────────────────────────────────────────

export function getQueueDomains(): [TaskDomain, TaskDomain] {
  // Cache resolved domains so they don't change mid-session
  try {
    const cached = localStorage.getItem("ss_queue_domains");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length === 2) {
        return parsed as [TaskDomain, TaskDomain];
      }
    }
  } catch {}

  const profile = loadProfile();
  let primary: TaskDomain = "writing";
  let secondary: TaskDomain = "analytical";

  if (profile) {
    [primary, secondary] = inferDomains(
      profile.behaviors ?? [],
      profile.rustySkill ?? "",
    );
  }

  localStorage.setItem("ss_queue_domains", JSON.stringify([primary, secondary]));
  return [primary, secondary];
}

// ─── Task selection ───────────────────────────────────────────────────────────

function pickTask(domain: TaskDomain, tier: TaskTier, exclude: string[] = []): BankTask | null {
  const seen = getSeenIds(domain);
  const excludeSet = new Set(exclude);

  // First pass: unseen tasks in tier
  let candidates = TASK_BANK.filter(
    t => t.domain === domain && t.tier === tier && !seen.has(t.id) && !excludeSet.has(t.id)
  );

  // If no unseen tasks in this tier → reset seen for this domain and try again
  if (candidates.length === 0) {
    resetSeen(domain);
    candidates = TASK_BANK.filter(
      t => t.domain === domain && t.tier === tier && !excludeSet.has(t.id)
    );
  }

  // Fallback: any tier in this domain if the specific tier has nothing
  if (candidates.length === 0) {
    candidates = TASK_BANK.filter(
      t => t.domain === domain && !excludeSet.has(t.id)
    );
  }

  if (candidates.length === 0) return null;

  // Pick randomly from candidates
  const task = candidates[Math.floor(Math.random() * candidates.length)];
  markSeen(domain, task.id);
  return task;
}

// ─── Queue slot → domain mapping ──────────────────────────────────────────────
// Slot 0 → primary domain
// Slot 1 → secondary domain
// Slot 2 → variety domain (different from both)

export type QueueSlot = 0 | 1 | 2;

export function getDomainForSlot(slot: QueueSlot): TaskDomain {
  const [primary, secondary] = getQueueDomains();
  if (slot === 0) return primary;
  if (slot === 1) return secondary;
  return getVarietyDomain(primary, secondary);
}

// ─── Pick a task for a slot ───────────────────────────────────────────────────

export function pickTaskForSlot(slot: QueueSlot, excludeIds: string[] = []): BankTask | null {
  const domain = getDomainForSlot(slot);
  const tier = getDifficultyTier() as TaskTier;
  return pickTask(domain, tier, excludeIds);
}

// ─── Convert BankTask → Challenge shape (matches challenges/page.tsx) ─────────

export interface QueuedChallenge {
  id:                string;
  title:             string;
  prompt:            string;
  constraint:        string;
  type:              string;
  tier:              string;
  domain:            TaskDomain;
  timeLimit:         number;
  evalType:          "self" | "claude";
  whatGoodLooksLike: string;
  status:            "pending" | "active" | "done";
  slot:              QueueSlot;
  bankId:            string;
  // runtime fields — set during/after a session
  startedAt?:        number;
  completedAt?:      number;
  elapsed?:          number;
  submissionText?:   string;
  supabaseId?:       string;
}

export function bankTaskToChallenge(task: BankTask, slot: QueueSlot): QueuedChallenge {
  return {
    id:                `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title:             task.title,
    prompt:            task.prompt,
    constraint:        task.constraint,
    type:              task.type,
    tier:              task.tier,
    domain:            task.domain,
    timeLimit:         task.timeLimit,
    evalType:          task.type === "writing" ? "claude" : "self",
    whatGoodLooksLike: task.whatGoodLooksLike,
    status:            "pending",
    slot,
    bankId:            task.id,
  };
}

// ─── Seed initial queue (called on first load) ────────────────────────────────

export function seedQueue(existingIds: string[] = []): QueuedChallenge[] {
  const queue: QueuedChallenge[] = [];
  const slots: QueueSlot[] = [0, 1, 2];

  for (const slot of slots) {
    const task = pickTaskForSlot(slot, existingIds);
    if (task) {
      const challenge = bankTaskToChallenge(task, slot);
      queue.push(challenge);
      existingIds.push(challenge.bankId);
    }
  }

  return queue;
}

// ─── Refill a slot after completion ──────────────────────────────────────────

export function refillSlot(
  slot: QueueSlot,
  currentBankIds: string[],
): QueuedChallenge | null {
  const task = pickTaskForSlot(slot, currentBankIds);
  if (!task) return null;
  return bankTaskToChallenge(task, slot);
}

// ─── Get slot for a completed challenge ───────────────────────────────────────

export function getSlotForChallenge(
  challengeId: string,
  challenges: QueuedChallenge[],
): QueueSlot | null {
  const ch = challenges.find(c => c.id === challengeId);
  return ch ? ch.slot : null;
}