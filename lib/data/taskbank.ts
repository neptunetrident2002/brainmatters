// ─── taskbank.ts ──────────────────────────────────────────────────────────────
//
// Static bank of 300 pre-written challenges.
// Structure: {type}-{domain}-{tier}-{n}
//
// Types:   writing (W) | recall (R) | logic (L)
// Domains: tech | writing | business | communication | analytical
// Tiers:   beginner | intermediate | advanced
// Count:   20 per domain per type = 300 total

export type TaskType   = "writing" | "recall" | "logic";
export type TaskDomain = "tech" | "writing" | "business" | "communication" | "analytical";
export type TaskTier   = "beginner" | "intermediate" | "advanced";

export interface BankTask {
  id:                string;
  title:             string;
  prompt:            string;
  constraint:        string;
  type:              TaskType;
  domain:            TaskDomain;
  tier:              TaskTier;
  timeLimit:         number;  // minutes
  whatGoodLooksLike: string;
}

// ─── WRITING × TECH ───────────────────────────────────────────────────────────

const W_TECH: BankTask[] = [
  // Beginner
  {
    id:"W-tech-001", type:"writing", domain:"tech", tier:"beginner", timeLimit:10,
    title:"Explain a Bug",
    prompt:"You found a bug in your code that took you 2 hours to fix. Write an explanation of what went wrong and why, as if explaining to a junior developer on your team.",
    constraint:"No code snippets. Plain English only. Max 150 words.",
    whatGoodLooksLike:"Clear cause and effect. Someone unfamiliar with the codebase should understand what went wrong.",
  },
  {
    id:"W-tech-002", type:"writing", domain:"tech", tier:"beginner", timeLimit:10,
    title:"The Case for a Tool",
    prompt:"Pick a developer tool you use daily. Write a message to your team recommending they adopt it. Assume they've never heard of it.",
    constraint:"No bullet points. Write in paragraphs. Max 150 words.",
    whatGoodLooksLike:"Specific benefits over generic praise. Addresses the obvious objection of 'why change what works'.",
  },
  {
    id:"W-tech-003", type:"writing", domain:"tech", tier:"beginner", timeLimit:10,
    title:"Declining a PR Review",
    prompt:"A colleague has asked you to review a large pull request urgently. You're under deadline. Write a message declining but not damaging the relationship.",
    constraint:"Must offer a concrete alternative. Max 100 words.",
    whatGoodLooksLike:"Honest about constraints. Doesn't over-apologise. Leaves the colleague with a clear next step.",
  },
  {
    id:"W-tech-004", type:"writing", domain:"tech", tier:"beginner", timeLimit:10,
    title:"Technical Update Email",
    prompt:"A feature you were building will be delayed by one week due to an unexpected dependency issue. Write the update email to your project manager.",
    constraint:"No jargon. Must include: reason, revised date, and what you're doing to prevent further delay. Max 120 words.",
    whatGoodLooksLike:"Takes ownership without being defensive. Specific revised timeline. Proactive about solution.",
  },
  {
    id:"W-tech-005", type:"writing", domain:"tech", tier:"beginner", timeLimit:10,
    title:"README Introduction",
    prompt:"Write the opening paragraph for a README file for a command-line tool that helps developers track their daily task completion rate.",
    constraint:"No markdown headers or bullet points in your answer. Just the paragraph. Max 100 words.",
    whatGoodLooksLike:"Tells you what it does, who it's for, and why it exists — in that order.",
  },
  {
    id:"W-tech-006", type:"writing", domain:"tech", tier:"beginner", timeLimit:10,
    title:"Explaining Downtime",
    prompt:"Your app experienced 30 minutes of downtime yesterday at peak hours. Write the public status page update explaining what happened after the issue is resolved.",
    constraint:"No technical jargon. Must include: what happened, impact, and what was done. Max 100 words.",
    whatGoodLooksLike:"Honest and specific without being alarmist. Users feel informed, not managed.",
  },
  {
    id:"W-tech-007", type:"writing", domain:"tech", tier:"beginner", timeLimit:10,
    title:"Meeting Follow-Up",
    prompt:"You just finished a sprint planning meeting. Write the follow-up message to your team summarising the three main decisions made and who owns what.",
    constraint:"No bullet points. Write as connected sentences. Max 120 words.",
    whatGoodLooksLike:"Each decision is clear. Ownership is unambiguous. Could be read by someone who wasn't in the meeting.",
  },
  // Intermediate
  {
    id:"W-tech-008", type:"writing", domain:"tech", tier:"intermediate", timeLimit:15,
    title:"Architecture Decision Record",
    prompt:"Your team is choosing between building a feature in-house or using a third-party API. Write the decision record explaining your recommendation, the trade-offs, and why the alternative was rejected.",
    constraint:"No tables or bullet points. Prose only. 200–250 words.",
    whatGoodLooksLike:"Clear recommendation up front. Trade-offs acknowledged honestly, not minimised. The rejected option is treated fairly.",
  },
  {
    id:"W-tech-009", type:"writing", domain:"tech", tier:"intermediate", timeLimit:15,
    title:"Pushing Back on a Deadline",
    prompt:"Your manager has set a deadline you believe is unrealistic for a feature that requires significant database migrations. Write a message pushing back with a counter-proposal.",
    constraint:"Must be professional, not passive-aggressive. Must propose a specific alternative date with justification. Max 180 words.",
    whatGoodLooksLike:"States the problem clearly without blame. Offers a solution, not just a problem. Doesn't hedge excessively.",
  },
  {
    id:"W-tech-010", type:"writing", domain:"tech", tier:"intermediate", timeLimit:15,
    title:"Incident Post-Mortem",
    prompt:"Write the narrative section of a post-mortem for a production incident where a database migration script ran on the wrong environment and deleted live data. Data was restored from backup within 2 hours.",
    constraint:"Blameless tone. Chronological. No technical jargon unexplained. 200 words max.",
    whatGoodLooksLike:"Timeline is clear. Focuses on system failure, not individual failure. Reader understands exactly what happened.",
  },
  {
    id:"W-tech-011", type:"writing", domain:"tech", tier:"intermediate", timeLimit:15,
    title:"Disagreeing with a Senior Developer",
    prompt:"A senior developer on your team has proposed a solution you believe will cause performance problems at scale. Write a message respectfully disagreeing and proposing your alternative.",
    constraint:"Must acknowledge what's good about their approach first. Max 200 words.",
    whatGoodLooksLike:"Specific about the performance concern. Not a personal critique. Invites discussion rather than demanding agreement.",
  },
  {
    id:"W-tech-012", type:"writing", domain:"tech", tier:"intermediate", timeLimit:15,
    title:"Onboarding Documentation",
    prompt:"Write the first section of an onboarding document for a new backend developer joining your team. Cover the most important thing they need to understand about how your codebase is structured.",
    constraint:"Write for someone who knows how to code but doesn't know your system. Max 200 words. No bullet points.",
    whatGoodLooksLike:"Gives mental model first, specifics second. Explains the 'why' of structural decisions, not just the 'what'.",
  },
  {
    id:"W-tech-013", type:"writing", domain:"tech", tier:"intermediate", timeLimit:15,
    title:"Scope Creep Response",
    prompt:"A client keeps adding requirements to a project that's already in development. Write a message addressing this professionally and re-establishing the agreed scope.",
    constraint:"Must not be confrontational. Must reference the original agreement. Max 180 words.",
    whatGoodLooksLike:"Firm on scope without being rigid. Offers a clear path for new requirements (next phase, change request). Doesn't punish the client for asking.",
  },
  {
    id:"W-tech-014", type:"writing", domain:"tech", tier:"intermediate", timeLimit:15,
    title:"Security Vulnerability Disclosure",
    prompt:"You've discovered a moderate-severity security vulnerability in an open source library your company uses. Write the responsible disclosure message to the library maintainers.",
    constraint:"Must include: nature of the vulnerability (you can be vague on specifics), severity assessment, and your proposed timeline for public disclosure. Max 200 words.",
    whatGoodLooksLike:"Professional and collaborative. Gives maintainers room to fix before disclosure. Not alarmist.",
  },
  // Advanced
  {
    id:"W-tech-015", type:"writing", domain:"tech", tier:"advanced", timeLimit:30,
    title:"Arguing Against a Rewrite",
    prompt:"Your CTO wants to rewrite your entire backend in a new language over the next 6 months. You believe this is a mistake. Write a persuasive memo arguing against it.",
    constraint:"Must acknowledge the legitimate frustrations driving the proposal. Must offer a concrete alternative path. 300 words max.",
    whatGoodLooksLike:"Engages seriously with the CTO's position. Specific risks identified, not generic. Alternative is concrete, not vague reassurance.",
  },
  {
    id:"W-tech-016", type:"writing", domain:"tech", tier:"advanced", timeLimit:30,
    title:"Engineering Blog Post Opening",
    prompt:"Write the opening 3 paragraphs of an engineering blog post about a hard technical problem your team solved — one that required abandoning your initial approach entirely.",
    constraint:"Must hook the reader in the first sentence. No 'In this post, we will...' openings. 250 words max.",
    whatGoodLooksLike:"Opens with the problem or the moment things went wrong. Reader wants to know what happened next.",
  },
  {
    id:"W-tech-017", type:"writing", domain:"tech", tier:"advanced", timeLimit:30,
    title:"Performance Review Self-Assessment",
    prompt:"Write a self-assessment section of a performance review for a mid-level software engineer. Focus on one technical achievement and one area of genuine improvement needed — without underselling or overselling either.",
    constraint:"No vague generalities. Each claim must be specific. 250 words max.",
    whatGoodLooksLike:"The achievement is concrete and the impact is stated. The improvement area is honest — not a disguised strength.",
  },
  {
    id:"W-tech-018", type:"writing", domain:"tech", tier:"advanced", timeLimit:30,
    title:"Proposal to Kill a Feature",
    prompt:"A feature that took your team 3 months to build has less than 2% adoption after 6 months. Write a proposal to deprecate and remove it, addressed to your product and engineering leads.",
    constraint:"Must address the sunk cost directly. Must include a deprecation timeline. 280 words max.",
    whatGoodLooksLike:"Makes the business case without dwelling on the failure. Treats the deprecation as progress, not defeat.",
  },
  {
    id:"W-tech-019", type:"writing", domain:"tech", tier:"advanced", timeLimit:30,
    title:"Hiring Feedback",
    prompt:"You interviewed a candidate for a senior engineering role. They were technically strong but showed poor communication and seemed dismissive of non-technical concerns. Write your feedback to the hiring committee.",
    constraint:"Be specific. Do not be vague or hedge excessively. Do not make it personal. 200 words max.",
    whatGoodLooksLike:"Specific behavioural observations, not character judgements. Clear recommendation. Would stand up to scrutiny.",
  },
  {
    id:"W-tech-020", type:"writing", domain:"tech", tier:"advanced", timeLimit:30,
    title:"The Case for Technical Debt",
    prompt:"Write a memo to non-technical stakeholders making the case for dedicating an entire sprint to addressing technical debt — with no user-visible output.",
    constraint:"No technical jargon. Must make the case in business terms. 250 words max.",
    whatGoodLooksLike:"The analogy to physical infrastructure or deferred maintenance is clear. The risk of inaction is specific, not vague.",
  },
];

// ─── WRITING × WRITING DOMAIN ─────────────────────────────────────────────────

const W_WRITING: BankTask[] = [
  // Beginner
  {
    id:"W-writing-001", type:"writing", domain:"writing", tier:"beginner", timeLimit:10,
    title:"Cold Email",
    prompt:"Write a cold outreach email to a potential collaborator in your field. You have no mutual connection. You want 20 minutes of their time.",
    constraint:"Max 100 words. Must end with a single, specific ask — not 'let me know if you're interested'.",
    whatGoodLooksLike:"Opens with something specific about them, not about you. The ask is clear and low-friction.",
  },
  {
    id:"W-writing-002", type:"writing", domain:"writing", tier:"beginner", timeLimit:10,
    title:"Negative Review Response",
    prompt:"Your business received a 2-star review that is partially unfair but contains one legitimate point. Write the public response.",
    constraint:"Max 120 words. Must acknowledge the legitimate point without being defensive about the unfair parts.",
    whatGoodLooksLike:"Doesn't grovel. Doesn't argue. Takes what's true seriously and briefly addresses what isn't.",
  },
  {
    id:"W-writing-003", type:"writing", domain:"writing", tier:"beginner", timeLimit:10,
    title:"Apology That Means Something",
    prompt:"You missed an important deadline and let a colleague down. Write a genuine apology message.",
    constraint:"No excuses. No 'but'. No 'I'm sorry you feel that way'. Max 80 words.",
    whatGoodLooksLike:"Names exactly what happened. Takes full ownership. Includes what will be different next time.",
  },
  {
    id:"W-writing-004", type:"writing", domain:"writing", tier:"beginner", timeLimit:10,
    title:"Asking for a Raise",
    prompt:"Write the message asking your manager for a salary review meeting. Don't make the ask in the message itself — just get the meeting.",
    constraint:"Max 80 words. Must give a reason for the meeting without revealing the full ask.",
    whatGoodLooksLike:"Professional and confident. Doesn't over-explain. Manager knows what the meeting is about without being ambushed.",
  },
  {
    id:"W-writing-005", type:"writing", domain:"writing", tier:"beginner", timeLimit:10,
    title:"LinkedIn Post",
    prompt:"Write a LinkedIn post about a lesson you learned the hard way in your professional life. No motivational fluff.",
    constraint:"Max 120 words. Must open with the lesson learned, not the story. No 'Unpopular opinion:' opener.",
    whatGoodLooksLike:"Specific enough to be believable. Reader learns something concrete, not a vague platitude.",
  },
  {
    id:"W-writing-006", type:"writing", domain:"writing", tier:"beginner", timeLimit:10,
    title:"Saying No Professionally",
    prompt:"A colleague has asked you to take on additional work that is genuinely outside your capacity right now. Write a message declining.",
    constraint:"No over-explanation or excessive apology. Must offer nothing you can't deliver. Max 90 words.",
    whatGoodLooksLike:"Direct. Doesn't create false hope. Doesn't make the asker feel bad for asking.",
  },
  {
    id:"W-writing-007", type:"writing", domain:"writing", tier:"beginner", timeLimit:10,
    title:"The Follow-Up",
    prompt:"You sent an important email 10 days ago and received no reply. Write a follow-up that doesn't sound passive-aggressive.",
    constraint:"Max 80 words. Must not use the word 'just' ('just checking in'). Must make it easy to reply.",
    whatGoodLooksLike:"Assumes good faith. Provides context in case the original was missed. Ends with a clear, specific question.",
  },
  // Intermediate
  {
    id:"W-writing-008", type:"writing", domain:"writing", tier:"intermediate", timeLimit:15,
    title:"Pitch Paragraph",
    prompt:"Write the opening paragraph of a pitch for a product, service, or idea you genuinely believe in. The reader is a sceptical investor who has seen a thousand pitches.",
    constraint:"Must not open with a question. Must not use the word 'revolutionise' or 'disrupt'. Max 120 words.",
    whatGoodLooksLike:"States the problem and the solution in the first two sentences. Specific enough to be credible.",
  },
  {
    id:"W-writing-009", type:"writing", domain:"writing", tier:"intermediate", timeLimit:15,
    title:"Giving Hard Feedback",
    prompt:"A direct report submitted a piece of work that is significantly below the standard required. It needs to be completely redone. Write the feedback.",
    constraint:"Must be specific about what fell short and why. Must not soften the message to the point of confusion. Max 180 words.",
    whatGoodLooksLike:"Clear that the work needs to be redone. Specific about what 'good' looks like. Doesn't protect feelings at the expense of clarity.",
  },
  {
    id:"W-writing-010", type:"writing", domain:"writing", tier:"intermediate", timeLimit:15,
    title:"Complaint Letter",
    prompt:"Write a formal complaint letter to a service provider about a recurring problem that hasn't been fixed after two previous contacts. You want a refund and a resolution.",
    constraint:"Firm but not hostile. Must reference the previous contacts. Must state exactly what outcome you expect. Max 200 words.",
    whatGoodLooksLike:"Documents the history clearly. States the desired outcome precisely. Tone is firm without being threatening.",
  },
  {
    id:"W-writing-011", type:"writing", domain:"writing", tier:"intermediate", timeLimit:15,
    title:"Announcing Bad News",
    prompt:"You need to inform your team that a project they've been working on for three months has been cancelled due to a budget cut. Write the announcement.",
    constraint:"Don't bury the news. Acknowledge the impact honestly. Max 180 words.",
    whatGoodLooksLike:"States the news in the first sentence. Acknowledges the team's effort and the unfairness. Gives next steps.",
  },
  {
    id:"W-writing-012", type:"writing", domain:"writing", tier:"intermediate", timeLimit:15,
    title:"Resignation Letter",
    prompt:"Write a resignation letter for a job you're leaving because you've been consistently undervalued, but you want to maintain the relationship professionally.",
    constraint:"Must not hint at the real reason while still being honest. Must be warm but final. Max 150 words.",
    whatGoodLooksLike:"Grateful without being sycophantic. Clear notice period. Leaves the door open without being ambiguous about leaving.",
  },
  {
    id:"W-writing-013", type:"writing", domain:"writing", tier:"intermediate", timeLimit:15,
    title:"Persuasive Essay Opening",
    prompt:"Write the opening two paragraphs of a persuasive essay arguing that remote work makes people better at their jobs — without using any statistics.",
    constraint:"No statistics. No 'studies show'. Argue from logic and observed reality. 200 words max.",
    whatGoodLooksLike:"Sets up a clear argument that will be developed. Doesn't try to win in the first paragraph. Reader wants to keep reading.",
  },
  {
    id:"W-writing-014", type:"writing", domain:"writing", tier:"intermediate", timeLimit:15,
    title:"Reference Letter",
    prompt:"Write a professional reference letter for a former colleague who was technically excellent but required significant management overhead. Be honest without destroying their chances.",
    constraint:"Must include one genuine, specific strength. Must not lie. Max 200 words.",
    whatGoodLooksLike:"Specific about the strength. The absence of claims about reliability or autonomy says something without lying.",
  },
  // Advanced
  {
    id:"W-writing-015", type:"writing", domain:"writing", tier:"advanced", timeLimit:30,
    title:"Op-Ed Opening",
    prompt:"Write the opening three paragraphs of an op-ed arguing that 'hustle culture' causes measurable harm to long-term productivity. You must make a specific, arguable claim — not a platitude.",
    constraint:"No statistics. Must make a claim that someone could reasonably disagree with. 250 words max.",
    whatGoodLooksLike:"The argument is clear from the first paragraph. Takes a position, not just a topic. Anticipates the obvious counter.",
  },
  {
    id:"W-writing-016", type:"writing", domain:"writing", tier:"advanced", timeLimit:30,
    title:"Eulogy for an Idea",
    prompt:"Write a short eulogy for an idea or approach that was once widely believed but has since been discredited or abandoned in your field. Treat it with genuine respect.",
    constraint:"Must acknowledge what was genuinely good about the idea. Must explain why it no longer holds. 280 words max.",
    whatGoodLooksLike:"Takes the idea seriously. Doesn't mock. The conclusion is earned, not assumed.",
  },
  {
    id:"W-writing-017", type:"writing", domain:"writing", tier:"advanced", timeLimit:30,
    title:"Cover Letter",
    prompt:"Write a cover letter for a senior role you are genuinely qualified for. Open with the most compelling thing about you — not 'I am writing to apply for...'",
    constraint:"Must be specific to the type of role, not generic. No opener about being passionate. 280 words max.",
    whatGoodLooksLike:"First sentence earns the second. Specific achievements, not responsibilities. Reader wants to see the CV.",
  },
  {
    id:"W-writing-018", type:"writing", domain:"writing", tier:"advanced", timeLimit:30,
    title:"Reframing Failure",
    prompt:"Write a case study summary of a project or initiative that failed. Frame it accurately — as a failure — while extracting what was genuinely learned.",
    constraint:"Do not use the phrase 'fail forward'. Do not minimise the failure. 280 words max.",
    whatGoodLooksLike:"Honest about the failure. The lessons are specific — things that actually changed, not generic wisdom.",
  },
  {
    id:"W-writing-019", type:"writing", domain:"writing", tier:"advanced", timeLimit:30,
    title:"Arguing Both Sides",
    prompt:"Write two short paragraphs: one arguing that specialisation is more valuable than generalism in a career; one arguing the opposite. Both must be persuasive.",
    constraint:"Neither paragraph should undermine the other. Both must be your best argument for that position. 240 words total max.",
    whatGoodLooksLike:"Both arguments are specific and grounded. A reader can't tell which one you actually believe.",
  },
  {
    id:"W-writing-020", type:"writing", domain:"writing", tier:"advanced", timeLimit:30,
    title:"The Difficult Conversation",
    prompt:"Write the opening message for a conversation where you need to tell a long-term client that you can no longer work with them — due to values misalignment, not performance.",
    constraint:"Must be honest without being cruel. Must not leave false hope. Max 200 words.",
    whatGoodLooksLike:"States the situation clearly. Gives the real reason at an appropriate level of honesty. Offers a clean ending.",
  },
];

// ─── WRITING × BUSINESS ───────────────────────────────────────────────────────

const W_BUSINESS: BankTask[] = [
  // Beginner
  {
    id:"W-business-001", type:"writing", domain:"business", tier:"beginner", timeLimit:10,
    title:"Meeting Agenda",
    prompt:"Write a meeting agenda for a 45-minute strategy discussion about whether your team should enter a new market segment. Five attendees, including the CFO.",
    constraint:"No bullet points. Write as prose. Include timing for each section. Max 150 words.",
    whatGoodLooksLike:"Clear objective for the meeting. Each section has a defined outcome, not just a topic. Time allocation is realistic.",
  },
  {
    id:"W-business-002", type:"writing", domain:"business", tier:"beginner", timeLimit:10,
    title:"Executive Summary",
    prompt:"Write a one-paragraph executive summary of a proposal to adopt a four-day work week in your organisation on a trial basis.",
    constraint:"Must include: what is being proposed, why, and what success looks like. Max 120 words.",
    whatGoodLooksLike:"A busy executive can understand the proposal in 30 seconds. No vague language about 'wellbeing and productivity'.",
  },
  {
    id:"W-business-003", type:"writing", domain:"business", tier:"beginner", timeLimit:10,
    title:"Investor Update",
    prompt:"Write a brief monthly investor update covering: one thing that went well, one thing that didn't, and what the focus is for next month.",
    constraint:"Be specific. Numbers where possible. Max 150 words.",
    whatGoodLooksLike:"Honest about the setback. The positive isn't inflated. Next month's focus is a single clear priority.",
  },
  {
    id:"W-business-004", type:"writing", domain:"business", tier:"beginner", timeLimit:10,
    title:"Vendor Negotiation",
    prompt:"Write an email to a software vendor asking for a 20% discount on renewal. You have a competing offer but prefer their product.",
    constraint:"Must not reveal your preference for their product. Must mention the competing offer without lying. Max 120 words.",
    whatGoodLooksLike:"Creates real leverage. Specific ask. Doesn't beg. Leaves the vendor a clear path to close the deal.",
  },
  {
    id:"W-business-005", type:"writing", domain:"business", tier:"beginner", timeLimit:10,
    title:"Team Goal Statement",
    prompt:"Write a quarterly goal statement for a 5-person product team. The goal is to reduce customer churn by improving the onboarding experience.",
    constraint:"Must be specific and measurable. No vague language like 'improve customer satisfaction'. Max 100 words.",
    whatGoodLooksLike:"Anyone reading this knows exactly what success looks like at the end of the quarter.",
  },
  {
    id:"W-business-006", type:"writing", domain:"business", tier:"beginner", timeLimit:10,
    title:"Partnership Proposal",
    prompt:"Write the opening paragraph of a partnership proposal to a complementary business that serves the same customers but doesn't compete with you.",
    constraint:"Must make the 'why now' clear. Must lead with value to them, not to you. Max 120 words.",
    whatGoodLooksLike:"They understand immediately what's being proposed and why it benefits them. No vague 'synergy' language.",
  },
  {
    id:"W-business-007", type:"writing", domain:"business", tier:"beginner", timeLimit:10,
    title:"Policy Announcement",
    prompt:"Your company is introducing a new expense policy that is more restrictive than the current one. Write the internal announcement.",
    constraint:"Don't bury the change. Explain the reason honestly. Max 150 words.",
    whatGoodLooksLike:"States the change clearly up front. The reason is credible. Employees know what to do differently.",
  },
  // Intermediate
  {
    id:"W-business-008", type:"writing", domain:"business", tier:"intermediate", timeLimit:15,
    title:"Board Update — Bad Quarter",
    prompt:"Write the narrative section of a board update for a quarter where revenue missed targets by 15% but the underlying metrics (retention, pipeline) improved. Make the honest case for confidence.",
    constraint:"Do not spin the miss. Do not blame external factors first. 220 words max.",
    whatGoodLooksLike:"Owns the miss. Makes the case for leading indicators without using them to avoid accountability.",
  },
  {
    id:"W-business-009", type:"writing", domain:"business", tier:"intermediate", timeLimit:15,
    title:"Firing a Client",
    prompt:"Write the message to a high-paying client who is consistently disrespectful to your team and demands work outside the agreed scope. You are ending the relationship.",
    constraint:"Professional. Final. Does not invite renegotiation. Max 180 words.",
    whatGoodLooksLike:"States the decision without extensive justification. Offers a clean transition. Not hostile.",
  },
  {
    id:"W-business-010", type:"writing", domain:"business", tier:"intermediate", timeLimit:15,
    title:"Merger Announcement",
    prompt:"Write the internal staff announcement for a merger between two small companies. Many employees are uncertain about job security.",
    constraint:"Must address job security directly — don't dodge it. Max 200 words.",
    whatGoodLooksLike:"Doesn't make promises it can't keep. Acknowledges uncertainty honestly. Gives a timeline for when more information will be available.",
  },
  {
    id:"W-business-011", type:"writing", domain:"business", tier:"intermediate", timeLimit:15,
    title:"Strategy Pivot",
    prompt:"Your startup is pivoting from B2C to B2B. Write the internal memo explaining the decision to your 12-person team, several of whom joined specifically for the consumer product.",
    constraint:"Acknowledge what is being given up. Make the business case honestly. 200 words max.",
    whatGoodLooksLike:"Specific about why. Honest about what the team is losing. Forward-looking without dismissing the past.",
  },
  {
    id:"W-business-012", type:"writing", domain:"business", tier:"intermediate", timeLimit:15,
    title:"Budget Request",
    prompt:"Write a budget request memo for hiring an additional team member when your team is already at headcount. You need to justify the exception.",
    constraint:"Must quantify the cost of not hiring (in time or revenue). Must be specific. 200 words max.",
    whatGoodLooksLike:"Makes the ROI case clearly. The cost of inaction is as concrete as the cost of hiring.",
  },
  {
    id:"W-business-013", type:"writing", domain:"business", tier:"intermediate", timeLimit:15,
    title:"Competitive Response",
    prompt:"A major competitor just launched a feature that your product doesn't have, and customers are asking about it. Write the internal message to your sales team on how to handle it.",
    constraint:"Must not trash the competitor. Must give the sales team something real to say. 180 words max.",
    whatGoodLooksLike:"Honest about the gap. Gives a legitimate reason to stay. Tells sales what to say and what not to say.",
  },
  {
    id:"W-business-014", type:"writing", domain:"business", tier:"intermediate", timeLimit:15,
    title:"Stakeholder Disagreement",
    prompt:"Two senior stakeholders have opposite views on the direction of a key project. You must write a message to both of them proposing a path forward.",
    constraint:"Must not take a side explicitly. Must move things forward. 180 words max.",
    whatGoodLooksLike:"Acknowledges both positions genuinely. Proposes a mechanism for resolution, not just a call for compromise.",
  },
  // Advanced
  {
    id:"W-business-015", type:"writing", domain:"business", tier:"advanced", timeLimit:30,
    title:"The Case Against Growth",
    prompt:"Write a memo arguing that your company should deliberately slow its growth rate this year to focus on unit economics and team quality. Addressed to a growth-oriented board.",
    constraint:"Must engage seriously with the board's growth mandate. 300 words max.",
    whatGoodLooksLike:"Makes the long-term case with specific risks of continuing at current pace. Doesn't sound like giving up.",
  },
  {
    id:"W-business-016", type:"writing", domain:"business", tier:"advanced", timeLimit:30,
    title:"Acquisition Memo",
    prompt:"Write the strategic rationale section of a memo proposing the acquisition of a small competitor. Address: why them, why now, and what the integration risk is.",
    constraint:"Must honestly assess integration risk — not minimise it. 300 words max.",
    whatGoodLooksLike:"The 'why now' is specific. The integration risk is acknowledged and addressed, not buried.",
  },
  {
    id:"W-business-017", type:"writing", domain:"business", tier:"advanced", timeLimit:30,
    title:"Founder Letter",
    prompt:"Write an annual letter to your company's stakeholders — investors, employees, customers — reflecting honestly on the year. Include one thing that went well and one significant mistake.",
    constraint:"The mistake must be specific and owned, not blamed on external factors. 300 words max.",
    whatGoodLooksLike:"The success is credible because the failure is honest. Stakeholders feel they're getting the real picture.",
  },
  {
    id:"W-business-018", type:"writing", domain:"business", tier:"advanced", timeLimit:30,
    title:"Saying No to a Big Opportunity",
    prompt:"Write an internal memo recommending you decline a large contract opportunity because it would distort your company's focus and culture, even though it would significantly increase revenue.",
    constraint:"Must acknowledge the financial impact honestly. Must make the strategic case. 280 words max.",
    whatGoodLooksLike:"The financial opportunity is clearly stated — not minimised. The case for saying no is strategic, not timid.",
  },
  {
    id:"W-business-019", type:"writing", domain:"business", tier:"advanced", timeLimit:30,
    title:"Communicating a Layoff",
    prompt:"Write the all-hands message announcing a 10% reduction in headcount due to a revenue shortfall. The people affected have already been notified individually.",
    constraint:"Must not use corporate euphemisms like 'restructuring' or 'right-sizing'. Must acknowledge the human impact. 280 words max.",
    whatGoodLooksLike:"States what happened plainly. Acknowledges the impact on those leaving and those staying. Gives clear next steps.",
  },
  {
    id:"W-business-020", type:"writing", domain:"business", tier:"advanced", timeLimit:30,
    title:"Values in Conflict",
    prompt:"Write a memo addressing a situation where following company policy would produce an outcome that violates the company's stated values. Propose a resolution.",
    constraint:"Must name the conflict explicitly. Must not pretend it isn't a conflict. 280 words max.",
    whatGoodLooksLike:"The conflict is stated clearly. The resolution is specific and actionable, not a call for 'balance'.",
  },
];

// ─── WRITING × COMMUNICATION ──────────────────────────────────────────────────

const W_COMMUNICATION: BankTask[] = [
  {
    id:"W-comm-001", type:"writing", domain:"communication", tier:"beginner", timeLimit:10,
    title:"Explain It Simply",
    prompt:"Choose a concept from your work that people consistently misunderstand. Write a plain-language explanation for someone completely outside your field.",
    constraint:"No jargon. No analogies involving sports. Max 150 words.",
    whatGoodLooksLike:"The explanation would actually land with someone who doesn't know your field. No unnecessary complexity.",
  },
  {
    id:"W-comm-002", type:"writing", domain:"communication", tier:"beginner", timeLimit:10,
    title:"Meeting Request",
    prompt:"You need 30 minutes with a very busy senior leader you don't know well. Write the message requesting the meeting. You have a specific proposal to present.",
    constraint:"Must make it easy to say yes. Must make the agenda clear without giving everything away. Max 100 words.",
    whatGoodLooksLike:"The ask is specific. The value is clear in one sentence. Offers multiple time slots or defers to their availability.",
  },
  {
    id:"W-comm-003", type:"writing", domain:"communication", tier:"beginner", timeLimit:10,
    title:"Clarifying Confusion",
    prompt:"You sent a message that was misinterpreted and caused unnecessary concern. Write the follow-up clarification without making the other person feel foolish for misreading it.",
    constraint:"Must not say 'I'm sorry for the confusion' as the opener. Max 100 words.",
    whatGoodLooksLike:"Clarifies without condescension. Takes responsibility for the original ambiguity.",
  },
  {
    id:"W-comm-004", type:"writing", domain:"communication", tier:"beginner", timeLimit:10,
    title:"Translating Jargon",
    prompt:"Write a brief that translates a technical project update into plain language for senior non-technical stakeholders. The project is a database migration that is 60% complete and on schedule.",
    constraint:"No technical terms without immediate plain-English explanation. Max 130 words.",
    whatGoodLooksLike:"Stakeholders understand what it means for them without needing to understand the technology.",
  },
  {
    id:"W-comm-005", type:"writing", domain:"communication", tier:"beginner", timeLimit:10,
    title:"The Ask",
    prompt:"You need a favour from a contact you haven't spoken to in over a year. Write the message reestablishing contact and making the ask honestly.",
    constraint:"Don't pretend you're not about to ask for something. Make the ask before the end. Max 120 words.",
    whatGoodLooksLike:"Honest about the gap. The ask is specific. The reader doesn't feel manipulated.",
  },
  {
    id:"W-comm-006", type:"writing", domain:"communication", tier:"beginner", timeLimit:10,
    title:"Thanking Someone Specifically",
    prompt:"Write a thank you message to a colleague who helped you significantly on a project, but in a way that isn't visible to others and won't be formally recognised.",
    constraint:"Must name exactly what they did and why it mattered. No generic appreciation. Max 100 words.",
    whatGoodLooksLike:"Specific enough that only that person could have received it. The impact is stated clearly.",
  },
  {
    id:"W-comm-007", type:"writing", domain:"communication", tier:"beginner", timeLimit:10,
    title:"Introducing Two People",
    prompt:"Write a double opt-in introduction email between two contacts who would genuinely benefit from knowing each other. You asked both before writing this.",
    constraint:"Must say specifically why each benefits. Must make it easy for them to take it from here. Max 130 words.",
    whatGoodLooksLike:"Each person understands exactly who they're being introduced to and why. The connector doesn't make it about themselves.",
  },
  // Intermediate
  {
    id:"W-comm-008", type:"writing", domain:"communication", tier:"intermediate", timeLimit:15,
    title:"Framing Difficult News",
    prompt:"Write a message to your team announcing that a much-anticipated company benefit is being removed due to cost pressures, effective next month.",
    constraint:"Must explain the reason without hiding behind it. Must acknowledge the impact on the team. 180 words max.",
    whatGoodLooksLike:"States the change immediately. The reason is honest. Doesn't ask people to 'understand' — acknowledges they might not.",
  },
  {
    id:"W-comm-009", type:"writing", domain:"communication", tier:"intermediate", timeLimit:15,
    title:"Cross-Functional Alignment",
    prompt:"Two departments have been working at cross-purposes for three months due to a miscommunication at the start of a project. Write the message that resets the relationship.",
    constraint:"Must acknowledge the history without assigning blame. Must propose a concrete next step. 200 words max.",
    whatGoodLooksLike:"Owns whatever part can be owned. The proposed reset is specific — a meeting, a shared document, a decision.",
  },
  {
    id:"W-comm-010", type:"writing", domain:"communication", tier:"intermediate", timeLimit:15,
    title:"Managing Up",
    prompt:"Your manager keeps changing priorities mid-sprint, which is costing your team significant time. Write the message raising this problem without it sounding like a complaint.",
    constraint:"Must include a specific proposed solution, not just the problem. 180 words max.",
    whatGoodLooksLike:"Frames it as a cost to the outcomes the manager cares about, not a personal grievance. The solution is workable.",
  },
  {
    id:"W-comm-011", type:"writing", domain:"communication", tier:"intermediate", timeLimit:15,
    title:"Public Apology",
    prompt:"Your company made a public mistake that affected customers. Write the public apology statement. The mistake was a data breach that exposed email addresses but no financial information.",
    constraint:"Must be specific about what happened. Must not use legal hedging language. 200 words max.",
    whatGoodLooksLike:"States what happened plainly. Takes responsibility. Tells customers what you're doing about it and what they should do.",
  },
  {
    id:"W-comm-012", type:"writing", domain:"communication", tier:"intermediate", timeLimit:15,
    title:"Escalation Message",
    prompt:"A problem has been escalating for two weeks without resolution at your level. Write the message escalating it to senior leadership without making your manager look bad.",
    constraint:"Must include: the problem, what has been tried, and why escalation is necessary now. 180 words max.",
    whatGoodLooksLike:"Documents the history clearly. The reason for escalation is about the problem, not about the people who couldn't solve it.",
  },
  {
    id:"W-comm-013", type:"writing", domain:"communication", tier:"intermediate", timeLimit:15,
    title:"Explaining a Decision People Won't Like",
    prompt:"Your team voted 6-2 in favour of a decision you're implementing. Write the message to the whole team explaining the decision and how dissenting views were considered.",
    constraint:"Must acknowledge the minority view without reopening the decision. 200 words max.",
    whatGoodLooksLike:"Acknowledges the dissent honestly. The reasoning is explained, not just stated. The decision is final without being dismissive.",
  },
  {
    id:"W-comm-014", type:"writing", domain:"communication", tier:"intermediate", timeLimit:15,
    title:"Feedback to a Manager",
    prompt:"Your manager is a strong strategic thinker but terrible at communicating decisions to the team, causing anxiety and confusion. Write the upward feedback.",
    constraint:"Must be specific about the behaviour, not the character. Must include an example. 180 words max.",
    whatGoodLooksLike:"The behaviour is named clearly. The impact is stated. The tone is constructive, not punishing.",
  },
  // Advanced
  {
    id:"W-comm-015", type:"writing", domain:"communication", tier:"advanced", timeLimit:30,
    title:"Crisis Communication",
    prompt:"Your company's product was named in a major news article alleging it was used for a harmful purpose that you didn't anticipate or intend. Write the initial public statement.",
    constraint:"Must not be defensive. Must not make promises you can't keep. Must acknowledge the concern seriously. 280 words max.",
    whatGoodLooksLike:"Takes the concern seriously without admitting liability. Commits to action. The tone conveys seriousness, not panic.",
  },
  {
    id:"W-comm-016", type:"writing", domain:"communication", tier:"advanced", timeLimit:30,
    title:"Change Management Letter",
    prompt:"Write the all-staff letter accompanying a major organisational restructuring that will change most teams' reporting lines and eliminate two management layers.",
    constraint:"Must address the most obvious employee concern (job security) directly. 300 words max.",
    whatGoodLooksLike:"Honest about the uncertainty. The rationale is clear. Employees know what happens next and when.",
  },
  {
    id:"W-comm-017", type:"writing", domain:"communication", tier:"advanced", timeLimit:30,
    title:"The Retraction",
    prompt:"You publicly stated something in a company forum that turned out to be incorrect. It influenced a team's decision. Write the retraction and correction.",
    constraint:"Must be specific about what was wrong. Must not minimise the impact. 240 words max.",
    whatGoodLooksLike:"States exactly what was wrong. Owns the impact without excessive self-flagellation. Gives the correct information clearly.",
  },
  {
    id:"W-comm-018", type:"writing", domain:"communication", tier:"advanced", timeLimit:30,
    title:"Convincing a Sceptic",
    prompt:"Write a message to a senior colleague who is resistant to a change you believe is necessary. They haven't said no — they've just consistently not engaged.",
    constraint:"Must try a different approach from whatever they're currently not responding to. 260 words max.",
    whatGoodLooksLike:"Diagnoses why they might not be engaging and addresses that specifically. Doesn't repeat the same argument louder.",
  },
  {
    id:"W-comm-019", type:"writing", domain:"communication", tier:"advanced", timeLimit:30,
    title:"Town Hall Opening",
    prompt:"Write the opening remarks for a company all-hands meeting happening one week after a difficult quarter and a round of redundancies.",
    constraint:"Must acknowledge what the room is feeling without dwelling on it. Must move toward future focus. 280 words max.",
    whatGoodLooksLike:"Names the mood in the room. Doesn't rush past it. Earns the right to be forward-looking by being honest first.",
  },
  {
    id:"W-comm-020", type:"writing", domain:"communication", tier:"advanced", timeLimit:30,
    title:"Negotiating in Writing",
    prompt:"Write an email negotiating the key terms of a contract where you need three specific changes but can only realistically win two of them. Choose which two you fight for and concede the third strategically.",
    constraint:"Must not reveal your priority order. Must be professional throughout. 270 words max.",
    whatGoodLooksLike:"Frames all three as important while creating room to concede one. The concession feels like a gift, not a capitulation.",
  },
];

// ─── WRITING × ANALYTICAL ─────────────────────────────────────────────────────

const W_ANALYTICAL: BankTask[] = [
  {
    id:"W-analytical-001", type:"writing", domain:"analytical", tier:"beginner", timeLimit:10,
    title:"Argument Summary",
    prompt:"Summarise the strongest argument you've heard this week — one you may disagree with. Present it as its best advocate would, not as a straw man.",
    constraint:"Must present it fairly enough that someone who holds that view would recognise it. Max 150 words.",
    whatGoodLooksLike:"The argument is presented in its strongest form. The reader can tell the writer understands it, even if they disagree.",
  },
  {
    id:"W-analytical-002", type:"writing", domain:"analytical", tier:"beginner", timeLimit:10,
    title:"Decision Write-Up",
    prompt:"Write a brief decision memo for a choice you made recently. State the options you considered, the criteria you used to choose, and what you decided.",
    constraint:"Must name at least two real alternatives that were seriously considered. Max 150 words.",
    whatGoodLooksLike:"The rejected options were actually considered — not strawmanned. The criteria are explicit.",
  },
  {
    id:"W-analytical-003", type:"writing", domain:"analytical", tier:"beginner", timeLimit:10,
    title:"Explain Your Reasoning",
    prompt:"Write a short explanation of why you hold a belief that most people in your immediate environment disagree with.",
    constraint:"Must engage with the strongest counter-argument. Must not be preachy. Max 150 words.",
    whatGoodLooksLike:"The counter-argument is taken seriously, not dismissed. The reasoning is specific.",
  },
  {
    id:"W-analytical-004", type:"writing", domain:"analytical", tier:"beginner", timeLimit:10,
    title:"Root Cause Analysis",
    prompt:"Think of something that went wrong in a project or work situation recently. Write a brief root cause analysis — not a list of what went wrong, but why it went wrong at the deepest level you can identify.",
    constraint:"Must go at least two levels deep ('it went wrong because X, which happened because Y'). Max 150 words.",
    whatGoodLooksLike:"Doesn't stop at surface cause. Gets to something structural or systemic, not just an individual mistake.",
  },
  {
    id:"W-analytical-005", type:"writing", domain:"analytical", tier:"beginner", timeLimit:10,
    title:"Assumption Audit",
    prompt:"Choose a plan or project you're currently working on. Write a list of the key assumptions it depends on — the things that must be true for the plan to succeed.",
    constraint:"No bullet points. Write as prose. Must identify at least three assumptions. Max 150 words.",
    whatGoodLooksLike:"The assumptions are real dependencies, not obvious statements. At least one would surprise someone reviewing the plan.",
  },
  {
    id:"W-analytical-006", type:"writing", domain:"analytical", tier:"beginner", timeLimit:10,
    title:"Changing Your Mind",
    prompt:"Write about a belief or position you held confidently six months ago that you've since changed. Explain specifically what changed your mind.",
    constraint:"Must identify the specific evidence or argument that shifted your view. Max 150 words.",
    whatGoodLooksLike:"The original position is stated clearly and fairly. The reason for changing is specific, not vague.",
  },
  {
    id:"W-analytical-007", type:"writing", domain:"analytical", tier:"beginner", timeLimit:10,
    title:"The Counterargument",
    prompt:"Take a position you hold strongly. Write the best possible counterargument to it — as if you were trying to convince yourself you're wrong.",
    constraint:"Must be genuinely challenging, not a straw man. Max 150 words.",
    whatGoodLooksLike:"The counter-argument is the strongest version, not a weakened one. A neutral reader would find it credible.",
  },
  // Intermediate
  {
    id:"W-analytical-008", type:"writing", domain:"analytical", tier:"intermediate", timeLimit:15,
    title:"Second-Order Consequences",
    prompt:"A company announces it will move to a fully remote work model permanently. Write a short analysis of the second-order consequences — not the obvious first-order effects, but what happens as a result of those.",
    constraint:"Must go beyond the obvious. Must consider effects on at least two different stakeholders. 200 words max.",
    whatGoodLooksLike:"The consequences are genuinely second-order, not just additional first-order effects dressed up.",
  },
  {
    id:"W-analytical-009", type:"writing", domain:"analytical", tier:"intermediate", timeLimit:15,
    title:"Red Teaming a Plan",
    prompt:"Take a plan or proposal you think is good. Write a red team analysis — argue as if you're trying to make it fail. What are the three most likely ways it goes wrong?",
    constraint:"Each failure mode must be specific and plausible. Not generic risk. 200 words max.",
    whatGoodLooksLike:"The failure modes are specific to this plan. A reader would recognise these as real risks, not theoretical ones.",
  },
  {
    id:"W-analytical-010", type:"writing", domain:"analytical", tier:"intermediate", timeLimit:15,
    title:"Comparing Frameworks",
    prompt:"Two people on your team approach a recurring problem using different mental frameworks. One focuses on root cause, one focuses on fast remediation. Write a comparison of both approaches as applied to a specific problem.",
    constraint:"Must be fair to both approaches. Must conclude with which is better for the specific context you've chosen. 220 words max.",
    whatGoodLooksLike:"Both approaches are represented at their best. The conclusion is contextual, not absolute.",
  },
  {
    id:"W-analytical-011", type:"writing", domain:"analytical", tier:"intermediate", timeLimit:15,
    title:"Signal vs. Noise",
    prompt:"You've been receiving a lot of customer feedback. Write a brief memo distinguishing which feedback signals something important that needs to change versus which is noise.",
    constraint:"Must use at least one specific example of each. Must explain your criteria for the distinction. 200 words max.",
    whatGoodLooksLike:"The criteria are explicit. The examples illustrate the difference clearly.",
  },
  {
    id:"W-analytical-012", type:"writing", domain:"analytical", tier:"intermediate", timeLimit:15,
    title:"Explaining an Unexpected Result",
    prompt:"A metric that should have gone up went down, despite doing all the right things. Write an analysis of possible explanations, from most to least likely.",
    constraint:"Must include at least one explanation that implicates something you did, not just external factors. 200 words max.",
    whatGoodLooksLike:"The explanations are genuinely ordered by likelihood, with reasoning. Internal causes are considered honestly.",
  },
  {
    id:"W-analytical-013", type:"writing", domain:"analytical", tier:"intermediate", timeLimit:15,
    title:"The Tradeoff Memo",
    prompt:"Write a memo analysing a decision where both options have significant advantages and you genuinely cannot optimise for both simultaneously. Make a recommendation.",
    constraint:"Must acknowledge what is genuinely lost by your recommendation. 200 words max.",
    whatGoodLooksLike:"The tradeoff is real — not a choice between a good option and a bad one. The recommendation is specific.",
  },
  {
    id:"W-analytical-014", type:"writing", domain:"analytical", tier:"intermediate", timeLimit:15,
    title:"Steelmanning the Opposition",
    prompt:"Write a steelman of the position that AI tools like ChatGPT are making people significantly less capable over time. You do not have to agree with this — just make the strongest possible case for it.",
    constraint:"Must be specific enough that someone who holds this view would say 'yes, that's my argument'. 200 words max.",
    whatGoodLooksLike:"Specific mechanisms are proposed, not vague concerns. The argument is coherent and internally consistent.",
  },
  // Advanced
  {
    id:"W-analytical-015", type:"writing", domain:"analytical", tier:"advanced", timeLimit:30,
    title:"Causal Claim",
    prompt:"Write a short analytical piece making the case for a specific causal claim in your field — something you believe causes something else, but where the relationship is genuinely debated.",
    constraint:"Must distinguish between correlation and causation explicitly. Must acknowledge the strongest counter-evidence. 280 words max.",
    whatGoodLooksLike:"The causal mechanism is proposed, not just the correlation. Counter-evidence is addressed, not ignored.",
  },
  {
    id:"W-analytical-016", type:"writing", domain:"analytical", tier:"advanced", timeLimit:30,
    title:"Policy Critique",
    prompt:"Choose a commonly-held best practice in your field and write a critique arguing it is either outdated, misapplied, or oversimplified in how it's typically used.",
    constraint:"Must propose what should replace it or how it should be refined. 280 words max.",
    whatGoodLooksLike:"The critique is specific. The alternative is concrete. Doesn't just say 'it depends' — says what it depends on.",
  },
  {
    id:"W-analytical-017", type:"writing", domain:"analytical", tier:"advanced", timeLimit:30,
    title:"The Honest Forecast",
    prompt:"Write a short forecast for a trend or development in your field over the next two years. State your confidence level and the key variables that would change your forecast.",
    constraint:"Must include specific conditions under which your forecast would be wrong. 280 words max.",
    whatGoodLooksLike:"The forecast is specific enough to be falsifiable. The uncertainty is real, not just hedging.",
  },
  {
    id:"W-analytical-018", type:"writing", domain:"analytical", tier:"advanced", timeLimit:30,
    title:"Systematic Disagreement",
    prompt:"Write an analysis of a decision made in your field or organisation that you believe was systematically wrong — not due to bad luck, but due to a flawed decision-making process. What was wrong with the process?",
    constraint:"Must identify the process flaw, not just the bad outcome. 300 words max.",
    whatGoodLooksLike:"Distinguishes between bad process and bad outcome clearly. The process flaw is specific and structural.",
  },
  {
    id:"W-analytical-019", type:"writing", domain:"analytical", tier:"advanced", timeLimit:30,
    title:"Unintended Consequences",
    prompt:"Choose a well-intentioned policy or practice in your organisation or field and analyse its unintended negative consequences — effects that weren't anticipated when it was introduced.",
    constraint:"Must be specific about mechanism. Must not conclude that the policy was therefore wrong — that's too easy. 280 words max.",
    whatGoodLooksLike:"The consequences are genuine and specific. The conclusion is nuanced — acknowledges both the benefit and the harm.",
  },
  {
    id:"W-analytical-020", type:"writing", domain:"analytical", tier:"advanced", timeLimit:30,
    title:"Bayesian Update",
    prompt:"Describe a situation where new information should have changed a team or organisation's position — but didn't. Analyse why the update didn't happen and what it would have taken for it to.",
    constraint:"Must be specific about what new information arrived and why it was ignored or discounted. 280 words max.",
    whatGoodLooksLike:"Identifies the cognitive or organisational mechanism that prevented the update. The analysis is structural, not just a story.",
  },
];

// ─── RECALL × TECH ────────────────────────────────────────────────────────────

const R_TECH: BankTask[] = [
  { id:"R-tech-001", type:"recall", domain:"tech", tier:"beginner", timeLimit:5, title:"HTTP Status Codes", prompt:"From memory, explain what the following HTTP status codes mean and when you'd expect to see each one: 200, 301, 400, 401, 403, 404, 500, 503.", constraint:"No looking anything up. Write everything you remember. It's okay to be incomplete.", whatGoodLooksLike:"Accurate definitions for most. Distinguishes 401 vs 403 correctly. Can give a real-world scenario for each." },
  { id:"R-tech-002", type:"recall", domain:"tech", tier:"beginner", timeLimit:5, title:"Git Commands", prompt:"From memory, list and explain the git commands you use most frequently. For each, explain what it actually does — not just the syntax.", constraint:"At least 8 commands. Explain each in your own words.", whatGoodLooksLike:"Explains what the command does, not just its name. Includes at least one non-obvious command like rebase or stash." },
  { id:"R-tech-003", type:"recall", domain:"tech", tier:"beginner", timeLimit:5, title:"Data Types", prompt:"From memory, describe the main data types in a programming language you use regularly. Include their memory implications and when you'd choose one over another.", constraint:"At least 5 types. Explain trade-offs, not just definitions.", whatGoodLooksLike:"Explains when to use each type and why. Mentions memory or performance implications at least once." },
  { id:"R-tech-004", type:"recall", domain:"tech", tier:"beginner", timeLimit:5, title:"The Request Lifecycle", prompt:"From memory, describe what happens from the moment a user types a URL into their browser and presses Enter, to the moment the page displays. As much detail as you can recall.", constraint:"No looking up. Write the steps in order.", whatGoodLooksLike:"Covers DNS, TCP, HTTP request/response, rendering. Gets the sequence right even if details are incomplete." },
  { id:"R-tech-005", type:"recall", domain:"tech", tier:"beginner", timeLimit:5, title:"SQL Basics", prompt:"From memory, write and explain the SQL clauses you use most frequently. For each, explain what it does and give a scenario where you'd use it.", constraint:"At least 6 clauses or keywords. No looking up syntax.", whatGoodLooksLike:"Correct explanations for core clauses. Distinguishes WHERE from HAVING. Can explain JOIN types." },
  { id:"R-tech-006", type:"recall", domain:"tech", tier:"beginner", timeLimit:5, title:"What is REST?", prompt:"From memory, explain what REST is — what makes an API RESTful, and what the core constraints are. Then explain which constraint is most often violated in APIs you've encountered.", constraint:"No looking up. Your own understanding in your own words.", whatGoodLooksLike:"Names the actual constraints (statelessness, uniform interface, etc.). The violation example is specific and plausible." },
  { id:"R-tech-007", type:"recall", domain:"tech", tier:"beginner", timeLimit:5, title:"Debugging Approach", prompt:"From memory, describe your personal systematic approach to debugging a problem you've never seen before. What do you do first, second, third?", constraint:"Must be specific to how you actually work, not generic advice.", whatGoodLooksLike:"Has a real process. Includes hypothesis testing. Isn't just 'Google the error message'." },
  { id:"R-tech-008", type:"recall", domain:"tech", tier:"intermediate", timeLimit:10, title:"Big O Notation", prompt:"From memory, explain Big O notation. Then give the time complexity of: binary search, bubble sort, hash table lookup, and accessing an element in an array by index. Explain why for each.", constraint:"Explain the 'why' — not just the answer.", whatGoodLooksLike:"Big O definition is accurate. Explanations show understanding, not just memorisation of answers." },
  { id:"R-tech-009", type:"recall", domain:"tech", tier:"intermediate", timeLimit:10, title:"Database Indexing", prompt:"From memory, explain what a database index is, how it works under the hood, when to use one, and when adding an index makes performance worse.", constraint:"Must explain the trade-off — when indexes hurt rather than help.", whatGoodLooksLike:"Explains the data structure (B-tree typically). Correctly identifies write performance and storage as costs." },
  { id:"R-tech-010", type:"recall", domain:"tech", tier:"intermediate", timeLimit:10, title:"Authentication vs Authorisation", prompt:"From memory, explain the difference between authentication and authorisation. Then describe how JWT tokens work — what's in them, how they're validated, and what their weaknesses are.", constraint:"Must cover JWT weaknesses honestly.", whatGoodLooksLike:"Auth vs authz distinction is clear. JWT structure (header/payload/signature) explained. At least one real weakness identified." },
  { id:"R-tech-011", type:"recall", domain:"tech", tier:"intermediate", timeLimit:10, title:"CAP Theorem", prompt:"From memory, explain the CAP theorem. Then give a real example of a system that prioritises consistency over availability and one that does the opposite. Explain why each made that choice.", constraint:"Real systems, not hypothetical ones.", whatGoodLooksLike:"CAP theorem stated correctly. Real systems named with valid reasoning for their choices." },
  { id:"R-tech-012", type:"recall", domain:"tech", tier:"intermediate", timeLimit:10, title:"Design Patterns", prompt:"From memory, name and explain at least 4 design patterns you've actually used in production code. For each, describe a specific situation where you applied it and why.", constraint:"Must be patterns you've actually used — not just ones you've read about.", whatGoodLooksLike:"Patterns are explained accurately. The usage examples are specific and plausible." },
  { id:"R-tech-013", type:"recall", domain:"tech", tier:"intermediate", timeLimit:10, title:"React/Component Lifecycle", prompt:"From memory, explain the component lifecycle in a frontend framework you use. Include how side effects should be managed and common mistakes developers make.", constraint:"Must include at least two common mistakes.", whatGoodLooksLike:"Lifecycle phases explained correctly. Common mistakes are real and specific, not vague." },
  { id:"R-tech-014", type:"recall", domain:"tech", tier:"intermediate", timeLimit:10, title:"Security Fundamentals", prompt:"From memory, explain the following security concepts and how to defend against each: SQL injection, XSS, CSRF.", constraint:"Must explain both the attack and the defence for each.", whatGoodLooksLike:"Attack mechanisms are accurate. Defences are specific (parameterised queries, CSP headers, CSRF tokens)." },
  { id:"R-tech-015", type:"recall", domain:"tech", tier:"advanced", timeLimit:15, title:"Distributed Systems Concepts", prompt:"From memory, explain: eventual consistency, the two-phase commit problem, and idempotency. For each, describe a real scenario where it matters.", constraint:"Scenarios must be specific — not 'in a distributed system'.", whatGoodLooksLike:"Definitions are accurate. Scenarios demonstrate real understanding of why each concept matters." },
  { id:"R-tech-016", type:"recall", domain:"tech", tier:"advanced", timeLimit:15, title:"Concurrency Models", prompt:"From memory, explain the difference between threads, processes, async/await, and event loops. Describe when you'd choose each and what problems each model introduces.", constraint:"Must include the failure modes of each approach.", whatGoodLooksLike:"Distinctions are clear and accurate. Failure modes are specific (race conditions, callback hell, blocking, etc.)." },
  { id:"R-tech-017", type:"recall", domain:"tech", tier:"advanced", timeLimit:15, title:"System Design: Rate Limiting", prompt:"From memory, describe how you would design a rate limiting system for a public API. Cover: the algorithm choices, storage considerations, and how you'd handle distributed deployments.", constraint:"Must cover at least two different rate limiting algorithms and their trade-offs.", whatGoodLooksLike:"Multiple algorithms covered (token bucket, sliding window, etc.). Distributed storage challenge acknowledged. Trade-offs discussed." },
  { id:"R-tech-018", type:"recall", domain:"tech", tier:"advanced", timeLimit:15, title:"Memory Management", prompt:"From memory, explain how memory management works in a language you use regularly. Cover: allocation, deallocation, garbage collection (if applicable), and common memory-related bugs.", constraint:"Must include specific bugs and how to detect them.", whatGoodLooksLike:"Mechanism is explained accurately. Bugs are specific and real (memory leaks, use after free, etc.)." },
  { id:"R-tech-019", type:"recall", domain:"tech", tier:"advanced", timeLimit:15, title:"Network Protocols", prompt:"From memory, explain the difference between TCP and UDP. Then explain where HTTP/2 and HTTP/3 improve on HTTP/1.1, and what trade-offs they introduce.", constraint:"Must cover at least two improvements and one trade-off for each HTTP version.", whatGoodLooksLike:"TCP/UDP distinction is accurate. HTTP improvements are specific (multiplexing, QUIC, etc.). Trade-offs are real." },
  { id:"R-tech-020", type:"recall", domain:"tech", tier:"advanced", timeLimit:15, title:"Your Biggest Technical Mistake", prompt:"From memory, describe the biggest technical mistake you've made professionally — the decision, why you made it, what happened, and what you learned that actually changed how you work.", constraint:"Must be a real mistake. Must describe a specific change in practice that resulted from it.", whatGoodLooksLike:"Specific and honest. The learning is concrete — something that changed, not just 'I learned to be more careful'." },
];

// ─── RECALL × WRITING DOMAIN ──────────────────────────────────────────────────

const R_WRITING: BankTask[] = [
  { id:"R-writing-001", type:"recall", domain:"writing", tier:"beginner", timeLimit:5, title:"Grammar Rules You Know", prompt:"From memory, write out the grammar rules you're most confident in and the ones you know you struggle with. Be specific — not 'punctuation' but which punctuation rules and why they're difficult.", constraint:"Must identify at least 2 rules you're uncertain about.", whatGoodLooksLike:"Specific rules named (Oxford comma, semicolon usage, etc.). Honest about gaps." },
  { id:"R-writing-002", type:"recall", domain:"writing", tier:"beginner", timeLimit:5, title:"Explain Passive vs Active Voice", prompt:"From memory, explain the difference between passive and active voice. Give 3 examples of each. Then explain when passive voice is actually the better choice.", constraint:"Must defend a legitimate use of passive voice.", whatGoodLooksLike:"Examples are correct. The defence of passive voice is specific and accurate (e.g. when the subject is unknown)." },
  { id:"R-writing-003", type:"recall", domain:"writing", tier:"beginner", timeLimit:5, title:"The Inverted Pyramid", prompt:"From memory, explain the inverted pyramid structure used in journalism. Describe when it works well and when it's inappropriate.", constraint:"Must give a specific example of when NOT to use it.", whatGoodLooksLike:"Structure explained correctly. The limitation is specific — not just 'it doesn't work for stories'." },
  { id:"R-writing-004", type:"recall", domain:"writing", tier:"beginner", timeLimit:5, title:"Persuasion Principles", prompt:"From memory, name and explain at least 4 principles of persuasive writing or rhetoric. For each, give a concrete example of how it's used.", constraint:"Examples must be specific — not 'a politician might use this'.", whatGoodLooksLike:"Principles are accurately named. Examples are concrete and appropriate." },
  { id:"R-writing-005", type:"recall", domain:"writing", tier:"beginner", timeLimit:5, title:"Writers Who Influenced You", prompt:"From memory, name three writers — in any form — whose style you've consciously or unconsciously absorbed. For each, describe what specifically about their writing affected yours.", constraint:"Must be specific about the stylistic influence, not just 'their clarity' or 'their storytelling'.", whatGoodLooksLike:"The influence is specific — a structural technique, a sentence pattern, a use of rhythm." },
  { id:"R-writing-006", type:"recall", domain:"writing", tier:"beginner", timeLimit:5, title:"Common Writing Mistakes", prompt:"From memory, list the 5 most common writing mistakes you see in professional communication — emails, reports, proposals — and explain what makes each one problematic.", constraint:"Must be specific errors you've actually encountered, not generic advice.", whatGoodLooksLike:"Specific and real. Reader recognises these as real patterns." },
  { id:"R-writing-007", type:"recall", domain:"writing", tier:"beginner", timeLimit:5, title:"The Edit Checklist", prompt:"From memory, describe your personal process for editing your own writing. What do you look for, in what order?", constraint:"Must be your actual process — not what you should do but what you do.", whatGoodLooksLike:"Has a real sequence. Specific things to look for. Acknowledges blind spots." },
  { id:"R-writing-008", type:"recall", domain:"writing", tier:"intermediate", timeLimit:10, title:"Sentence-Level Rhythm", prompt:"From memory, explain what sentence rhythm is in writing and how it affects a reader's experience. Describe three techniques writers use to control rhythm.", constraint:"Techniques must be specific and named.", whatGoodLooksLike:"Rhythm concept explained accurately. Techniques are specific (varied sentence length, punctuation, sentence openings)." },
  { id:"R-writing-009", type:"recall", domain:"writing", tier:"intermediate", timeLimit:10, title:"Narrative Structure", prompt:"From memory, explain at least three different narrative structures beyond the standard three-act structure. For each, describe when it's the stronger choice.", constraint:"Must go beyond three-act. Must justify each structure contextually.", whatGoodLooksLike:"Structures are accurately described (hero's journey, in medias res, non-linear, etc.). Contextual justifications are specific." },
  { id:"R-writing-010", type:"recall", domain:"writing", tier:"intermediate", timeLimit:10, title:"Editing Other People's Work", prompt:"From memory, describe your approach to editing someone else's writing. What do you look for first? How do you give feedback they'll actually act on?", constraint:"Must distinguish between structural and line editing.", whatGoodLooksLike:"Has a process. Structural before line edit distinction is clear. Feedback approach is practical." },
  { id:"R-writing-011", type:"recall", domain:"writing", tier:"intermediate", timeLimit:10, title:"The Hook", prompt:"From memory, describe at least 5 different techniques for opening a piece of writing — article, email, report, essay — in a way that compels the reader to continue.", constraint:"Each technique must be distinct. Give an example of each.", whatGoodLooksLike:"Techniques are genuinely distinct. Examples are clear and illustrate the technique." },
  { id:"R-writing-012", type:"recall", domain:"writing", tier:"intermediate", timeLimit:10, title:"Tone and Register", prompt:"From memory, explain the concept of register in writing. Describe how you adjust your register across different writing contexts and give examples of where you've misjudged it.", constraint:"Must include an honest example of misjudging register.", whatGoodLooksLike:"Register explained correctly. Adjustment examples are specific. The misjudgement example is genuine." },
  { id:"R-writing-013", type:"recall", domain:"writing", tier:"intermediate", timeLimit:10, title:"Concision", prompt:"From memory, explain what concision means in writing — not just 'using fewer words' but what it actually requires. Then identify the 5 most common sources of unnecessary wordiness.", constraint:"Sources must be specific patterns, not 'using too many words'.", whatGoodLooksLike:"Concision defined accurately (removing without losing meaning). Sources are specific (nominalisation, redundant pairs, throat-clearing)." },
  { id:"R-writing-014", type:"recall", domain:"writing", tier:"intermediate", timeLimit:10, title:"Argument Structure", prompt:"From memory, explain the Toulmin model of argument structure. Name all six components and explain each. Then identify which component is most often missing in professional writing.", constraint:"Must cover all six components.", whatGoodLooksLike:"All six components named and explained correctly. The missing component observation is specific and arguable." },
  { id:"R-writing-015", type:"recall", domain:"writing", tier:"advanced", timeLimit:15, title:"The Essay Form", prompt:"From memory, describe the history and conventions of the personal essay as a literary form. Identify three writers who defined or expanded it. Explain what distinguishes a great personal essay from a mediocre one.", constraint:"Must be specific about what makes an essay great, not just 'authenticity'.", whatGoodLooksLike:"Writers named accurately. The distinguishing quality is specific and arguable." },
  { id:"R-writing-016", type:"recall", domain:"writing", tier:"advanced", timeLimit:15, title:"Rhetoric's Three Appeals", prompt:"From memory, explain ethos, pathos, and logos in full. For each, describe a piece of writing that relies primarily on it, and explain the risks of over-relying on each appeal.", constraint:"Risks must be specific, not just 'it doesn't work'.", whatGoodLooksLike:"Appeals defined accurately. Risks are specific and real." },
  { id:"R-writing-017", type:"recall", domain:"writing", tier:"advanced", timeLimit:15, title:"Style Guides", prompt:"From memory, describe the main differences between at least three major style guides (AP, Chicago, MLA, APA, or others). Explain when you would choose each and what their core philosophies differ on.", constraint:"Must cover substantive differences, not just citation format.", whatGoodLooksLike:"Substantive philosophical differences noted, not just formatting differences." },
  { id:"R-writing-018", type:"recall", domain:"writing", tier:"advanced", timeLimit:15, title:"The Writer's Block Question", prompt:"From memory, describe the most well-developed theory you know of for what causes writer's block and how to address it. Then describe what actually works for you.", constraint:"Must distinguish between the theory and your personal experience.", whatGoodLooksLike:"Theory is specific and well-described. Personal experience is honest and specific." },
  { id:"R-writing-019", type:"recall", domain:"writing", tier:"advanced", timeLimit:15, title:"Unreliable Narrators", prompt:"From memory, name and describe at least four different types of unreliable narrator. For each, explain what creates the unreliability and name a work that uses it.", constraint:"Types must be genuinely distinct, not variations of the same thing.", whatGoodLooksLike:"Types are distinct and accurately described. Works cited are accurate." },
  { id:"R-writing-020", type:"recall", domain:"writing", tier:"advanced", timeLimit:15, title:"The Sentence", prompt:"From memory, explain what makes a great sentence — one that works at the level of meaning, rhythm, sound, and precision simultaneously. Name three sentences you consider great and analyse why.", constraint:"Sentence analysis must cover at least two of the four dimensions.", whatGoodLooksLike:"Analysis is specific and literary. The reasoning engages seriously with the writing." },
];

// ─── RECALL × BUSINESS ────────────────────────────────────────────────────────

const R_BUSINESS: BankTask[] = [
  { id:"R-business-001", type:"recall", domain:"business", tier:"beginner", timeLimit:5, title:"Business Models", prompt:"From memory, name and describe 8 distinct business models. For each, give a real company example and explain what makes that model work.", constraint:"Models must be genuinely distinct. Examples must be real companies.", whatGoodLooksLike:"8 accurate models. Examples are appropriate. The 'what makes it work' is specific." },
  { id:"R-business-002", type:"recall", domain:"business", tier:"beginner", timeLimit:5, title:"Financial Statements", prompt:"From memory, describe the three core financial statements — what each shows, what its key components are, and how the three connect to each other.", constraint:"Must explain how they connect — not just what each one is.", whatGoodLooksLike:"All three described accurately. The connection between them is explained correctly (net income flows to retained earnings, etc.)." },
  { id:"R-business-003", type:"recall", domain:"business", tier:"beginner", timeLimit:5, title:"Porter's Five Forces", prompt:"From memory, name and explain all five of Porter's competitive forces. Then apply them to an industry you know well.", constraint:"Must apply all five to a specific industry.", whatGoodLooksLike:"All five forces named and explained correctly. Application is specific and insightful." },
  { id:"R-business-004", type:"recall", domain:"business", tier:"beginner", timeLimit:5, title:"Key Business Metrics", prompt:"From memory, explain the following metrics: CAC, LTV, churn rate, gross margin, burn rate. For each, explain what it tells you and what a healthy number looks like.", constraint:"Must give at least a rough sense of what healthy looks like for each.", whatGoodLooksLike:"Definitions accurate. Health benchmarks reasonable. Can explain why each metric matters." },
  { id:"R-business-005", type:"recall", domain:"business", tier:"beginner", timeLimit:5, title:"Negotiation Principles", prompt:"From memory, describe the BATNA concept and explain how it should change your behaviour in a negotiation. Give a specific example of how you'd apply it.", constraint:"Example must be specific, not hypothetical.", whatGoodLooksLike:"BATNA defined correctly. Application is specific. Shows understanding of how leverage actually works." },
  { id:"R-business-006", type:"recall", domain:"business", tier:"beginner", timeLimit:5, title:"Product-Market Fit", prompt:"From memory, explain what product-market fit means, how you know when you have it, and what typically happens to companies that scale before achieving it.", constraint:"Must include specific indicators of PMF, not just 'customers love it'.", whatGoodLooksLike:"Specific PMF indicators (retention, organic growth, pull vs push). Scaling-before-PMF consequences are real." },
  { id:"R-business-007", type:"recall", domain:"business", tier:"beginner", timeLimit:5, title:"Pricing Strategies", prompt:"From memory, name and explain at least 5 pricing strategies. For each, describe the conditions under which it works best and when it fails.", constraint:"Must explain failure conditions, not just success conditions.", whatGoodLooksLike:"Five distinct strategies. Failure conditions are specific and real." },
  { id:"R-business-008", type:"recall", domain:"business", tier:"intermediate", timeLimit:10, title:"Decision-Making Frameworks", prompt:"From memory, describe at least 4 structured decision-making frameworks. For each, explain what type of decision it's suited to and what its blind spot is.", constraint:"Must include a blind spot for each framework.", whatGoodLooksLike:"Frameworks accurately described. Blind spots are genuine, not minor quibbles." },
  { id:"R-business-009", type:"recall", domain:"business", tier:"intermediate", timeLimit:10, title:"Unit Economics", prompt:"From memory, explain unit economics in full — what it means, how to calculate it, and how it should inform strategic decisions. Give a real or realistic example.", constraint:"Must include specific calculation with example numbers.", whatGoodLooksLike:"Unit economics defined correctly. Calculation is accurate. Strategic implication is clear." },
  { id:"R-business-010", type:"recall", domain:"business", tier:"intermediate", timeLimit:10, title:"Go-to-Market Strategy", prompt:"From memory, describe the components of a go-to-market strategy. Explain how a B2B GTM differs from a B2C GTM. Give a specific example of each.", constraint:"Must cover at least 4 GTM components. Must explain the B2B/B2C distinction specifically.", whatGoodLooksLike:"Components are specific and complete. B2B/B2C distinction is meaningful (sales motion, channel, pricing)." },
  { id:"R-business-011", type:"recall", domain:"business", tier:"intermediate", timeLimit:10, title:"Organisational Design", prompt:"From memory, describe at least three different organisational structures. For each, explain what problems it solves and what problems it creates.", constraint:"Problems created must be as specific as problems solved.", whatGoodLooksLike:"Three distinct structures (functional, divisional, matrix, etc.). Problems created are real and specific." },
  { id:"R-business-012", type:"recall", domain:"business", tier:"intermediate", timeLimit:10, title:"Competitive Moats", prompt:"From memory, explain Warren Buffett's concept of economic moat. Describe at least 5 different types of moat with a real company example for each.", constraint:"Examples must be genuinely illustrative of that moat type.", whatGoodLooksLike:"Moat concept accurate. Five types clearly distinct. Company examples are appropriate." },
  { id:"R-business-013", type:"recall", domain:"business", tier:"intermediate", timeLimit:10, title:"The Sales Process", prompt:"From memory, describe the full sales cycle from lead to close for a B2B product. Identify where deals most commonly stall and why.", constraint:"Must identify at least 2 common stall points with specific reasons.", whatGoodLooksLike:"Cycle is complete. Stall points are specific and accurate (champion not having budget authority, etc.)." },
  { id:"R-business-014", type:"recall", domain:"business", tier:"intermediate", timeLimit:10, title:"OKRs vs KPIs", prompt:"From memory, explain the difference between OKRs and KPIs. Describe when each is the right tool, and what goes wrong when OKRs are implemented badly.", constraint:"Must explain the specific failure modes of bad OKR implementation.", whatGoodLooksLike:"Distinction is clear. Failure modes are specific (sandbagging, too many OKRs, treating KRs as tasks)." },
  { id:"R-business-015", type:"recall", domain:"business", tier:"advanced", timeLimit:15, title:"Capital Allocation", prompt:"From memory, explain the concept of capital allocation as a core CEO responsibility. Describe the main options for deploying capital and how a great capital allocator decides between them.", constraint:"Must cover at least 5 options. Must explain the decision criteria.", whatGoodLooksLike:"Five options accurately described. Decision framework is specific, not vague." },
  { id:"R-business-016", type:"recall", domain:"business", tier:"advanced", timeLimit:15, title:"Network Effects", prompt:"From memory, explain direct and indirect network effects. Name a company that benefits from each type. Then explain why most network effect businesses fail to achieve defensible scale.", constraint:"Must address why most fail, not just how the successful ones work.", whatGoodLooksLike:"Distinction between direct/indirect is accurate. Failure analysis is specific." },
  { id:"R-business-017", type:"recall", domain:"business", tier:"advanced", timeLimit:15, title:"Corporate Strategy Frameworks", prompt:"From memory, describe and compare at least three corporate strategy frameworks (e.g. BCG Matrix, Ansoff Matrix, Blue Ocean Strategy). For each, explain what question it answers and what it cannot tell you.", constraint:"What it cannot tell you must be substantive, not trivial.", whatGoodLooksLike:"Frameworks accurately described. Limitations are substantive and specific." },
  { id:"R-business-018", type:"recall", domain:"business", tier:"advanced", timeLimit:15, title:"Mergers and Acquisitions", prompt:"From memory, describe the main reasons M&A transactions fail to create value, and explain what separates the acquisitions that do create value from those that don't.", constraint:"Must give specific mechanisms for both failure and success.", whatGoodLooksLike:"Failure mechanisms are specific (culture, integration, overpayment, etc.). Success factors are grounded in evidence." },
  { id:"R-business-019", type:"recall", domain:"business", tier:"advanced", timeLimit:15, title:"Venture Capital Mechanics", prompt:"From memory, explain how venture capital economics work — fund structure, return dynamics, why VCs need outliers, and how this shapes the advice they give founders.", constraint:"Must explain how VC economics influence the advice they give — including when that advice is bad for founders.", whatGoodLooksLike:"Economics explained accurately. The founder-VC misalignment is addressed specifically." },
  { id:"R-business-020", type:"recall", domain:"business", tier:"advanced", timeLimit:15, title:"The Best Business Decision You've Seen", prompt:"From memory, describe the best business decision you've witnessed or studied — one that was non-obvious at the time. Explain why it was right and what made it hard to make.", constraint:"Must be specific. Must address why it was hard, not just why it was correct.", whatGoodLooksLike:"Specific and well-analysed. The difficulty is real — not just 'people didn't believe it'." },
];

// ─── RECALL × COMMUNICATION ───────────────────────────────────────────────────

const R_COMMUNICATION: BankTask[] = [
  { id:"R-comm-001", type:"recall", domain:"communication", tier:"beginner", timeLimit:5, title:"Active Listening", prompt:"From memory, explain what active listening is — not the common definition but the specific behaviours that constitute it. Then describe a situation where you failed to do it and what happened.", constraint:"Must include the failure example. Must be specific about which behaviours were absent.", whatGoodLooksLike:"Behaviours are specific (reflecting, not interrupting, etc.). Failure example is honest." },
  { id:"R-comm-002", type:"recall", domain:"communication", tier:"beginner", timeLimit:5, title:"Non-Verbal Communication", prompt:"From memory, describe the main categories of non-verbal communication and explain which is most important in a professional context. Give a specific example of a non-verbal signal you've misread.", constraint:"Must include the misread example.", whatGoodLooksLike:"Categories are accurate. The misread example is honest and illustrative." },
  { id:"R-comm-003", type:"recall", domain:"communication", tier:"beginner", timeLimit:5, title:"Communication Styles", prompt:"From memory, describe at least 4 distinct communication styles (not personality types — communication styles). Explain what each needs from others to communicate effectively.", constraint:"Must describe what each style needs, not just what it is.", whatGoodLooksLike:"Styles are distinct and accurately described. What each needs is specific." },
  { id:"R-comm-004", type:"recall", domain:"communication", tier:"beginner", timeLimit:5, title:"Conflict Resolution Models", prompt:"From memory, describe a structured approach to resolving a conflict between two colleagues where you are a neutral third party. What are the steps, in order?", constraint:"Must be a real model or a well-structured personal process.", whatGoodLooksLike:"Steps are in a logical order. Focuses on positions vs interests. Doesn't skip the listening phase." },
  { id:"R-comm-005", type:"recall", domain:"communication", tier:"beginner", timeLimit:5, title:"Feedback Models", prompt:"From memory, describe at least 3 structured feedback models (e.g. SBI, STAR, etc.). For each, explain what it does well and when it falls short.", constraint:"Must include a genuine limitation for each.", whatGoodLooksLike:"Models accurately described. Limitations are real, not trivial." },
  { id:"R-comm-006", type:"recall", domain:"communication", tier:"beginner", timeLimit:5, title:"Cross-Cultural Communication", prompt:"From memory, describe at least 3 specific ways that communication norms differ across cultures, with real examples. Include one that has caused you confusion or misunderstanding.", constraint:"Must include a personal example of confusion.", whatGoodLooksLike:"Differences are specific (directness, hierarchy, silence, etc.). Personal example is honest." },
  { id:"R-comm-007", type:"recall", domain:"communication", tier:"beginner", timeLimit:5, title:"Presentation Structure", prompt:"From memory, describe how you structure a 10-minute presentation to a sceptical audience who haven't asked for your presentation. What order do you put things in and why?", constraint:"Must justify the order — not just list the components.", whatGoodLooksLike:"Order is justified. Acknowledges the audience's initial scepticism in the structure." },
  { id:"R-comm-008", type:"recall", domain:"communication", tier:"intermediate", timeLimit:10, title:"Persuasion Psychology", prompt:"From memory, describe Cialdini's six principles of influence. For each, give a specific example of how it's used ethically and one of how it's misused.", constraint:"Must cover all six. Must give both ethical and misuse examples for each.", whatGoodLooksLike:"All six principles named and described accurately. Examples are specific and appropriate." },
  { id:"R-comm-009", type:"recall", domain:"communication", tier:"intermediate", timeLimit:10, title:"Negotiation Tactics", prompt:"From memory, describe at least 5 specific negotiation tactics — what they involve, when to use them, and how to respond when they're used against you.", constraint:"Must include counter-responses for each tactic.", whatGoodLooksLike:"Tactics are specific and named. Counter-responses are practical." },
  { id:"R-comm-010", type:"recall", domain:"communication", tier:"intermediate", timeLimit:10, title:"Managing Difficult Conversations", prompt:"From memory, describe a framework for managing a high-stakes difficult conversation — one where the relationship is important and the stakes are high on both sides.", constraint:"Must be a real framework you know or have developed. Must cover preparation, not just the conversation itself.", whatGoodLooksLike:"Preparation phase included. Framework addresses both content and relationship. Specific techniques used." },
  { id:"R-comm-011", type:"recall", domain:"communication", tier:"intermediate", timeLimit:10, title:"Storytelling Structure", prompt:"From memory, describe the narrative structures used in effective professional storytelling — pitch presentations, case studies, keynotes. Explain what makes each effective.", constraint:"Must include at least 3 structures. Must explain effectiveness, not just describe the structure.", whatGoodLooksLike:"Structures are distinct. Effectiveness is explained in terms of audience psychology." },
  { id:"R-comm-012", type:"recall", domain:"communication", tier:"intermediate", timeLimit:10, title:"Meeting Facilitation", prompt:"From memory, describe your approach to facilitating a meeting where there is genuine disagreement and no clear authority to decide. What do you do at each stage?", constraint:"Must address how you handle a participant who is dominating the discussion.", whatGoodLooksLike:"Structured approach. Handles domination specifically. Focuses on reaching a useful outcome." },
  { id:"R-comm-013", type:"recall", domain:"communication", tier:"intermediate", timeLimit:10, title:"Written Communication Norms", prompt:"From memory, describe how written communication norms differ across Slack, email, documents, and formal reports. What mistakes do people make when they apply the wrong norms?", constraint:"Must give specific examples of wrong-norm mistakes.", whatGoodLooksLike:"Norms are specific to each medium. Mistakes are real and recognisable." },
  { id:"R-comm-014", type:"recall", domain:"communication", tier:"intermediate", timeLimit:10, title:"Emotional Intelligence in Communication", prompt:"From memory, describe the four domains of emotional intelligence and explain how each shows up (or fails to show up) in professional communication.", constraint:"Must give specific behavioural examples for each domain.", whatGoodLooksLike:"Four domains accurately identified. Behavioural examples are specific." },
  { id:"R-comm-015", type:"recall", domain:"communication", tier:"advanced", timeLimit:15, title:"Rhetoric and Persuasion", prompt:"From memory, describe the history of rhetoric as a discipline — its origins, its key figures, and how it's been applied and misapplied across history.", constraint:"Must include at least one case where rhetoric was used unethically and its consequences.", whatGoodLooksLike:"History is accurate. Key figures are real. The unethical use case is specific." },
  { id:"R-comm-016", type:"recall", domain:"communication", tier:"advanced", timeLimit:15, title:"Organisational Communication Breakdowns", prompt:"From memory, describe the most common structural reasons that important information fails to flow correctly in organisations. For each, explain the mechanism and a potential remedy.", constraint:"At least 4 mechanisms. Remedies must be specific.", whatGoodLooksLike:"Mechanisms are structural (not just 'poor communication'). Remedies are actionable." },
  { id:"R-comm-017", type:"recall", domain:"communication", tier:"advanced", timeLimit:15, title:"Crisis Communication", prompt:"From memory, describe a well-handled and a poorly-handled corporate crisis communication. For each, explain what specifically was done well or badly and what the outcome was.", constraint:"Both must be real, named cases.", whatGoodLooksLike:"Real cases accurately described. Analysis is specific — what decision was made and why it worked or failed." },
  { id:"R-comm-018", type:"recall", domain:"communication", tier:"advanced", timeLimit:15, title:"Communication and Power", prompt:"From memory, explain how power dynamics affect communication in organisations. Describe specific ways that hierarchical power distorts information flow, and what leaders can do to counteract it.", constraint:"Must name specific distortions, not just 'people don't speak up'.", whatGoodLooksLike:"Distortions are specific (yes-man dynamic, information filtering, etc.). Countermeasures are practical." },
  { id:"R-comm-019", type:"recall", domain:"communication", tier:"advanced", timeLimit:15, title:"The Most Effective Communicator You Know", prompt:"From memory, describe the most effective communicator you've worked with. What specifically made them effective — not their personality, but their behaviours and techniques?", constraint:"Must be specific about behaviours, not personality traits.", whatGoodLooksLike:"Behaviours are specific and observable. Not 'they were confident' but what they actually did." },
  { id:"R-comm-020", type:"recall", domain:"communication", tier:"advanced", timeLimit:15, title:"Communication That Changed Something", prompt:"From memory, describe a piece of communication — written or spoken — that you've encountered that genuinely changed how you think about something important. Analyse why it was effective.", constraint:"Must analyse the communication technique, not just the idea.", whatGoodLooksLike:"The technique analysis is specific. Why it worked for you personally is honest." },
];

// ─── RECALL × ANALYTICAL ──────────────────────────────────────────────────────

const R_ANALYTICAL: BankTask[] = [
  { id:"R-analytical-001", type:"recall", domain:"analytical", tier:"beginner", timeLimit:5, title:"Cognitive Biases", prompt:"From memory, name and explain 8 cognitive biases. For each, give an example of how it might affect a professional decision.", constraint:"Examples must be professional, not everyday examples.", whatGoodLooksLike:"8 biases accurately named and defined. Professional examples are plausible." },
  { id:"R-analytical-002", type:"recall", domain:"analytical", tier:"beginner", timeLimit:5, title:"Basic Statistics", prompt:"From memory, explain: mean vs median vs mode and when each is the right measure. Explain the difference between correlation and causation with a real example.", constraint:"The correlation/causation example must be real.", whatGoodLooksLike:"All three measures explained with correct when-to-use guidance. The correlation/causation example is real and accurate." },
  { id:"R-analytical-003", type:"recall", domain:"analytical", tier:"beginner", timeLimit:5, title:"Logic Fallacies", prompt:"From memory, name and explain 8 logical fallacies. For each, give a realistic example from a professional context.", constraint:"Examples must be realistic professional scenarios.", whatGoodLooksLike:"8 fallacies accurately described. Examples are clear and appropriate." },
  { id:"R-analytical-004", type:"recall", domain:"analytical", tier:"beginner", timeLimit:5, title:"Problem-Solving Frameworks", prompt:"From memory, describe 4 structured problem-solving frameworks. For each, describe the type of problem it's best suited to.", constraint:"Frameworks must be genuinely distinct.", whatGoodLooksLike:"Frameworks accurately described. Problem-type matching is specific." },
  { id:"R-analytical-005", type:"recall", domain:"analytical", tier:"beginner", timeLimit:5, title:"First Principles Thinking", prompt:"From memory, explain first principles thinking — what it is, how it differs from reasoning by analogy, and when it's more powerful and when it's less practical.", constraint:"Must include when it's less practical.", whatGoodLooksLike:"Distinction from analogy reasoning is accurate. Limitations are specific and honest." },
  { id:"R-analytical-006", type:"recall", domain:"analytical", tier:"beginner", timeLimit:5, title:"Mental Models", prompt:"From memory, name and explain your 5 most-used mental models. For each, describe a specific decision or situation where it helped you think more clearly.", constraint:"Must be models you actually use, not just know.", whatGoodLooksLike:"Models are specific. Usage examples are honest and specific." },
  { id:"R-analytical-007", type:"recall", domain:"analytical", tier:"beginner", timeLimit:5, title:"Hypothesis Testing", prompt:"From memory, explain the concept of hypothesis testing. Describe how you'd apply it to a non-scientific problem — like evaluating whether a change to a product improved user engagement.", constraint:"Must apply the concept practically, not just in scientific terms.", whatGoodLooksLike:"Core concept accurate. Practical application is specific and reasonable." },
  { id:"R-analytical-008", type:"recall", domain:"analytical", tier:"intermediate", timeLimit:10, title:"Bayesian Reasoning", prompt:"From memory, explain Bayesian reasoning — what it means to update your beliefs based on evidence. Give a realistic example of how you'd apply Bayesian thinking to a business decision.", constraint:"Example must be specific and use actual probability reasoning.", whatGoodLooksLike:"Core concept accurate. Example uses conditional probability correctly even if informally." },
  { id:"R-analytical-009", type:"recall", domain:"analytical", tier:"intermediate", timeLimit:10, title:"Systems Thinking", prompt:"From memory, explain the key concepts of systems thinking — feedback loops, leverage points, unintended consequences. Give an example of a real system you've observed that exhibits these properties.", constraint:"Example must be real and specific.", whatGoodLooksLike:"Concepts accurate. Real example shows genuine systems thinking, not just describing a process." },
  { id:"R-analytical-010", type:"recall", domain:"analytical", tier:"intermediate", timeLimit:10, title:"Data Interpretation", prompt:"From memory, describe the most common mistakes people make when interpreting data. For each, explain the mechanism — why it produces wrong conclusions — and how to guard against it.", constraint:"At least 5 mistakes. Mechanisms must be specific.", whatGoodLooksLike:"Mistakes are specific and real. Mechanisms are explained accurately. Guards are practical." },
  { id:"R-analytical-011", type:"recall", domain:"analytical", tier:"intermediate", timeLimit:10, title:"Game Theory Basics", prompt:"From memory, explain the prisoner's dilemma, Nash equilibrium, and the concept of dominant strategy. Describe a real business situation that resembles a prisoner's dilemma.", constraint:"Business situation must be genuine.", whatGoodLooksLike:"Concepts are accurately explained. Business example is appropriate." },
  { id:"R-analytical-012", type:"recall", domain:"analytical", tier:"intermediate", timeLimit:10, title:"Expected Value", prompt:"From memory, explain expected value and how it should be used in decision-making. Describe a real or realistic decision where EV reasoning leads to a different conclusion than intuition would.", constraint:"Example must be specific and the EV calculation reasonable.", whatGoodLooksLike:"EV defined correctly. Example shows genuine tension between intuition and EV." },
  { id:"R-analytical-013", type:"recall", domain:"analytical", tier:"intermediate", timeLimit:10, title:"Falsifiability", prompt:"From memory, explain Popper's concept of falsifiability. Describe 3 claims in your field — one that is falsifiable, one that is unfalsifiable but still useful, and one that is unfalsifiable and dangerous.", constraint:"All three examples must come from your actual field of work.", whatGoodLooksLike:"Falsifiability concept accurate. Three examples are genuinely from their field." },
  { id:"R-analytical-014", type:"recall", domain:"analytical", tier:"intermediate", timeLimit:10, title:"Occam's Razor", prompt:"From memory, explain Occam's Razor accurately — including the most common misapplication of it. Then describe a situation where the more complex explanation was actually correct.", constraint:"Misapplication must be specific. The complex-explanation example must be real.", whatGoodLooksLike:"Razor defined accurately. Misapplication is a real pattern. Complex-explanation example is genuine." },
  { id:"R-analytical-015", type:"recall", domain:"analytical", tier:"advanced", timeLimit:15, title:"Complex Systems", prompt:"From memory, explain the properties that distinguish complex adaptive systems from complicated systems. Describe two real-world examples — one from nature, one from human organisation — and explain what insights the complex systems lens offers.", constraint:"Must explain the practical implications of the distinction.", whatGoodLooksLike:"Distinction is accurate. Examples are genuinely complex, not just complicated." },
  { id:"R-analytical-016", type:"recall", domain:"analytical", tier:"advanced", timeLimit:15, title:"Epistemology Basics", prompt:"From memory, describe the main positions in epistemology — how we know what we know. Explain the significance of the distinction between empiricism and rationalism for how you approach problems at work.", constraint:"Must connect to your actual work, not remain abstract.", whatGoodLooksLike:"Main positions accurately described. Connection to work is genuine and specific." },
  { id:"R-analytical-017", type:"recall", domain:"analytical", tier:"advanced", timeLimit:15, title:"Black Swan Events", prompt:"From memory, explain Taleb's concept of Black Swan events — not just the definition but the implications for how systems should be designed. Describe one Black Swan event you've studied and what it reveals about the limits of prediction.", constraint:"Historical example must be real and accurately described.", whatGoodLooksLike:"Taleb's argument is accurately captured. Historical example is accurate. System design implications are specific." },
  { id:"R-analytical-018", type:"recall", domain:"analytical", tier:"advanced", timeLimit:15, title:"Philosophy of Causation", prompt:"From memory, describe the main philosophical positions on causation — what it means for one thing to cause another. Explain why this matters for how we interpret data.", constraint:"Must connect to data interpretation specifically.", whatGoodLooksLike:"At least two positions described accurately. Connection to data interpretation is specific." },
  { id:"R-analytical-019", type:"recall", domain:"analytical", tier:"advanced", timeLimit:15, title:"The Limits of Rationality", prompt:"From memory, describe the concept of bounded rationality and explain what it implies for how organisations should make decisions. Then describe a specific case where assuming full rationality produced a bad outcome.", constraint:"Case must be specific — real or from your own experience.", whatGoodLooksLike:"Bounded rationality accurately defined. Implications are specific. Case is genuine." },
  { id:"R-analytical-020", type:"recall", domain:"analytical", tier:"advanced", timeLimit:15, title:"How You've Been Wrong", prompt:"From memory, describe the most significant way your analytical thinking has been systematically wrong — a pattern of reasoning that consistently led you to bad conclusions. What corrected it?", constraint:"Must be specific and honest. The correction must be concrete.", whatGoodLooksLike:"Specific systematic error identified. The correction is real, not aspirational." },
];

// ─── LOGIC × TECH ─────────────────────────────────────────────────────────────

const L_TECH: BankTask[] = [
  { id:"L-tech-001", type:"logic", domain:"tech", tier:"beginner", timeLimit:8, title:"Find the Flaw", prompt:"Here is an argument: 'Our app has 10,000 users and 500 of them use feature X. Since 5% use it, it's not worth maintaining.' Identify the flaws in this reasoning.", constraint:"Find at least 2 distinct logical flaws. Explain each.", whatGoodLooksLike:"Identifies: survivorship bias (who's not using it and why), lack of comparison baseline, possible disproportionate value from those 500." },
  { id:"L-tech-002", type:"logic", domain:"tech", tier:"beginner", timeLimit:8, title:"Algorithm Logic Check", prompt:"A developer says: 'I tested my sorting algorithm on 100 random arrays and it worked every time, so it must be correct.' What is wrong with this reasoning?", constraint:"Identify the logical problem and explain what proper correctness verification requires.", whatGoodLooksLike:"Identifies that testing proves presence of bugs, not absence. Points to formal verification or edge case testing." },
  { id:"L-tech-003", type:"logic", domain:"tech", tier:"beginner", timeLimit:8, title:"Correlation in Metrics", prompt:"After adding a new feature, your DAU increases 15%. Your manager says 'the new feature caused user growth.' Identify what's wrong with this conclusion and what you'd need to confirm causation.", constraint:"Must identify at least 2 alternative explanations for the metric increase.", whatGoodLooksLike:"Identifies correlation ≠ causation. Suggests control group, timing analysis. Mentions possible confounding variables." },
  { id:"L-tech-004", type:"logic", domain:"tech", tier:"beginner", timeLimit:8, title:"The Optimisation Trap", prompt:"An argument: 'Our database queries are slow, so we should add more indexes.' Evaluate this reasoning. What's missing from the analysis?", constraint:"Must explain the trade-off that makes this reasoning incomplete.", whatGoodLooksLike:"Notes that indexes slow writes and use storage. Points out the need to identify which queries are slow and why before adding indexes." },
  { id:"L-tech-005", type:"logic", domain:"tech", tier:"beginner", timeLimit:8, title:"Security Reasoning Flaw", prompt:"'We use HTTPS, so our application is secure.' Identify the flaws in this reasoning.", constraint:"Find at least 3 distinct security concerns not addressed by HTTPS.", whatGoodLooksLike:"Notes HTTPS only covers transport. Misses: authentication, authorisation, input validation, application-layer attacks, etc." },
  { id:"L-tech-006", type:"logic", domain:"tech", tier:"beginner", timeLimit:8, title:"Requirements Logic", prompt:"A PM says: 'Users complained that the app is slow, so we should add a loading spinner.' Analyse the logic of this solution.", constraint:"Explain what's wrong with the jump from problem to solution.", whatGoodLooksLike:"Identifies treating symptoms vs causes. A spinner addresses perception, not performance. Root cause not investigated." },
  { id:"L-tech-007", type:"logic", domain:"tech", tier:"beginner", timeLimit:8, title:"Rewrite Reasoning", prompt:"'Our codebase is messy and hard to work in, so we should rewrite it from scratch.' Analyse this reasoning.", constraint:"Identify the logical assumptions that make this conclusion premature.", whatGoodLooksLike:"Points to: unknown debt will be recreated, assumes new code will be better, ignores value of existing battle-tested code, big bang vs incremental." },
  { id:"L-tech-008", type:"logic", domain:"tech", tier:"intermediate", timeLimit:12, title:"Availability vs Reliability", prompt:"A technical lead argues: 'We have 99.9% uptime, so our system is reliable.' Analyse this claim and explain what's missing from this assessment of reliability.", constraint:"Must distinguish between availability and reliability specifically.", whatGoodLooksLike:"Uptime ≠ reliability. Reliability covers correctness, not just availability. Doesn't address data consistency, correctness of results, or MTTR." },
  { id:"L-tech-009", type:"logic", domain:"tech", tier:"intermediate", timeLimit:12, title:"Scale Assumption", prompt:"'Our architecture works perfectly at 1,000 users, so it will work at 1,000,000 users.' Identify the specific technical assumptions that make this reasoning flawed.", constraint:"Must identify at least 4 specific technical issues that emerge at scale.", whatGoodLooksLike:"Database bottlenecks, network bandwidth, cache invalidation, session management, third-party API limits — specific technical failure modes." },
  { id:"L-tech-010", type:"logic", domain:"tech", tier:"intermediate", timeLimit:12, title:"A/B Test Interpretation", prompt:"An A/B test runs for 3 days. Variant B gets 12% more conversions. Someone says: 'B is the winner, let's ship it.' Identify all the issues with concluding the test here.", constraint:"Must identify at least 4 distinct issues with this conclusion.", whatGoodLooksLike:"Sample size, statistical significance, day-of-week effects, novelty effect, segment differences — multiple specific issues." },
  { id:"L-tech-011", type:"logic", domain:"tech", tier:"intermediate", timeLimit:12, title:"Technology Choice Logic", prompt:"'Everyone is using microservices now, so we should migrate to microservices.' Evaluate this reasoning for a 5-person startup.", constraint:"Must evaluate the specific argument structure, not just give general advice on microservices.", whatGoodLooksLike:"Identifies appeal to popularity fallacy. Points to missing context (team size, problem complexity, current pain points). Notes organisational prerequisites." },
  { id:"L-tech-012", type:"logic", domain:"tech", tier:"intermediate", timeLimit:12, title:"Performance Reasoning", prompt:"'We optimised the slowest function and cut its execution time by 80%. Our users will definitely notice a performance improvement.' Identify the logical gaps in this conclusion.", constraint:"Reference Amdahl's Law in your analysis.", whatGoodLooksLike:"Amdahl's Law applied correctly. Points out the slowest function may not be on the critical path. User perception ≠ execution time." },
  { id:"L-tech-013", type:"logic", domain:"tech", tier:"intermediate", timeLimit:12, title:"Incident Reasoning", prompt:"After an outage, the post-mortem concludes: 'The engineer who deployed the change caused the incident.' Analyse why this root cause analysis is likely insufficient.", constraint:"Must explain the blameless post-mortem principle and what it should identify instead.", whatGoodLooksLike:"Individual blame vs system analysis. Should identify: why the change could be deployed without testing, why monitoring didn't catch it sooner, etc." },
  { id:"L-tech-014", type:"logic", domain:"tech", tier:"intermediate", timeLimit:12, title:"Feature vs Bug", prompt:"A user reports: 'The system always deletes my preferences when I log out on mobile.' The team debates whether this is a feature or a bug. Construct the logical criteria you'd use to make this decision.", constraint:"Must define clear, principled criteria, not just 'what the user wants'.", whatGoodLooksLike:"Criteria include: documented intended behaviour, security implications, user expectations vs actual behaviour, impact on other users." },
  { id:"L-tech-015", type:"logic", domain:"tech", tier:"advanced", timeLimit:20, title:"Consistency vs Availability Trade-off", prompt:"Analyse the following argument: 'We need both strong consistency and high availability in our distributed system, so we'll use a combination of techniques to achieve both.' Evaluate this reasoning in light of the CAP theorem.", constraint:"Must address specific techniques and their actual trade-offs.", whatGoodLooksLike:"CAP theorem applied correctly. Evaluates CRDT, eventual consistency approaches. Shows why 'both' always involves a partition-tolerance trade-off." },
  { id:"L-tech-016", type:"logic", domain:"tech", tier:"advanced", timeLimit:20, title:"Security by Obscurity", prompt:"Evaluate this security argument: 'We don't publish our API schema or error messages because it makes us more secure.' Analyse both what's valid and what's flawed in this reasoning.", constraint:"Must fairly represent both sides before giving a conclusion.", whatGoodLooksLike:"Acknowledges limited information can reduce attack surface. But identifies: not a substitute for proper security, Kerckhoffs's principle, relies on secrecy of system not just key." },
  { id:"L-tech-017", type:"logic", domain:"tech", tier:"advanced", timeLimit:20, title:"Greenfield Fallacy", prompt:"A team argues: 'If we could start over with today's knowledge and modern tools, we could build this in 3 months.' Evaluate the logical validity of this estimate.", constraint:"Must identify the specific cognitive errors embedded in this type of estimation.", whatGoodLooksLike:"Planning fallacy, unknown unknowns, underestimating integration complexity, ignoring the value of the existing system's battle-testing." },
  { id:"L-tech-018", type:"logic", domain:"tech", tier:"advanced", timeLimit:20, title:"Conway's Law Argument", prompt:"Evaluate the argument: 'If we reorganise our teams according to our desired system architecture, the code will naturally improve to match.' Analyse the logic of applying Conway's Law in reverse.", constraint:"Must analyse both why this can work and why it can fail.", whatGoodLooksLike:"Reverse Conway manoeuvre is a real practice. But identifies: teams may not produce the architecture, requires significant coordination, ignores incentives." },
  { id:"L-tech-019", type:"logic", domain:"tech", tier:"advanced", timeLimit:20, title:"Technical Debt Reasoning", prompt:"Analyse this argument: 'We can't afford to pay down technical debt right now because we need to ship features. We'll do it after this quarter.' Identify all the logical and strategic problems with this reasoning.", constraint:"Must identify at least 4 specific problems.", whatGoodLooksLike:"Compound interest on debt, next quarter will have the same pressures, defining 'after this quarter' is the same as never, increasing carrying cost." },
  { id:"L-tech-020", type:"logic", domain:"tech", tier:"advanced", timeLimit:20, title:"AI Tool Adoption Logic", prompt:"Evaluate this argument: 'Developers who don't use AI coding tools will become uncompetitive, so everyone should adopt them immediately.' Analyse the logic, steelman it, and identify its key assumptions.", constraint:"Must steelman the argument before critiquing it.", whatGoodLooksLike:"Steelman is genuine. Critique identifies specific assumptions that might not hold. Conclusion is nuanced." },
];

// ─── LOGIC × WRITING DOMAIN ───────────────────────────────────────────────────

const L_WRITING: BankTask[] = [
  { id:"L-writing-001", type:"logic", domain:"writing", tier:"beginner", timeLimit:8, title:"Identify the Assumption", prompt:"Argument: 'This email got a 40% open rate, which proves the subject line was excellent.' What is the hidden assumption in this argument?", constraint:"Identify the assumption and explain why it might not hold.", whatGoodLooksLike:"The assumption is that open rate = quality of subject line. Misses: list quality, send time, sender reputation, audience." },
  { id:"L-writing-002", type:"logic", domain:"writing", tier:"beginner", timeLimit:8, title:"Circular Reasoning", prompt:"Identify the circular reasoning in this argument: 'This is a well-written piece because it communicates clearly. We know it communicates clearly because it's well-written.'", constraint:"Explain what circular reasoning is and what external criterion is missing.", whatGoodLooksLike:"Circular reasoning accurately identified. Explains what an independent standard of clarity would look like." },
  { id:"L-writing-003", type:"logic", domain:"writing", tier:"beginner", timeLimit:8, title:"Ad Hominem Analysis", prompt:"A critic writes: 'This business plan isn't credible because the founder dropped out of university.' Analyse this argument.", constraint:"Identify the fallacy and explain when background actually is relevant.", whatGoodLooksLike:"Ad hominem identified. But also notes that credentials can be legitimately relevant context — distinguishes attack on argument vs person." },
  { id:"L-writing-004", type:"logic", domain:"writing", tier:"beginner", timeLimit:8, title:"False Dichotomy", prompt:"Evaluate: 'Either we rewrite this report from scratch or we leave it as is. Since we can't rewrite it, we have to leave it as is.'", constraint:"Identify the fallacy and list at least 3 options that were excluded.", whatGoodLooksLike:"False dichotomy identified. Legitimate alternatives: partial rewrite, restructure, edit sections, executive summary." },
  { id:"L-writing-005", type:"logic", domain:"writing", tier:"beginner", timeLimit:8, title:"Appeal to Authority", prompt:"Evaluate: 'Shakespeare used passive voice, so passive voice must be acceptable in all professional writing.'", constraint:"Explain what's wrong with this appeal to authority specifically.", whatGoodLooksLike:"Context collapse — Shakespeare was writing drama, not business documents. Appeal to authority fallacy. Explains when authority is legitimate." },
  { id:"L-writing-006", type:"logic", domain:"writing", tier:"beginner", timeLimit:8, title:"Slippery Slope", prompt:"Evaluate: 'If we allow writers to break the comma rules once, soon all grammatical standards will collapse and no one will take our publication seriously.'", constraint:"Explain why this is a slippery slope argument and what would need to be true for it to be valid.", whatGoodLooksLike:"Slippery slope identified. Notes what would make it valid: mechanism for each step. Distinguishes from legitimate 'this sets a precedent' concerns." },
  { id:"L-writing-007", type:"logic", domain:"writing", tier:"beginner", timeLimit:8, title:"Hasty Generalisation", prompt:"Evaluate: 'Every great writer I've studied worked early in the morning. Therefore, to become a great writer you should work early in the morning.'", constraint:"Identify the fallacy and explain what the causal claim actually requires.", whatGoodLooksLike:"Hasty generalisation identified. Correlation/causation issue. Selection bias in sample. What a valid causal claim would require." },
  { id:"L-writing-008", type:"logic", domain:"writing", tier:"intermediate", timeLimit:12, title:"Structural Analysis", prompt:"Analyse the logical structure of this argument: 'Long-form content performs better in search than short-form. Our competitors use short-form content. Therefore we should use long-form content.' Is this valid? Sound?", constraint:"Distinguish between validity and soundness in your analysis.", whatGoodLooksLike:"Valid/sound distinction applied correctly. Premises evaluated. Hidden assumptions identified (that outranking competitors requires long-form)." },
  { id:"L-writing-009", type:"logic", domain:"writing", tier:"intermediate", timeLimit:12, title:"The Editing Argument", prompt:"Evaluate: 'I've edited this document 10 times. At some point, further editing makes it worse not better. Therefore I should stop editing.' Is this argument logically sound?", constraint:"Identify what's valid, what's flawed, and what information is missing to evaluate it properly.", whatGoodLooksLike:"The diminishing returns premise can be valid but needs evidence. Missing: what constitutes 'worse', whether the right aspects have been edited." },
  { id:"L-writing-010", type:"logic", domain:"writing", tier:"intermediate", timeLimit:12, title:"Audience Assumption", prompt:"Evaluate this argument for a communication strategy: 'Our audience is educated professionals, so we can use technical language freely without explanation.' Analyse the logical gaps.", constraint:"Identify at least 3 distinct problems with this reasoning.", whatGoodLooksLike:"Educated ≠ familiar with your specific domain. Reading contexts vary. Cognitive load still applies. Technical language can signal exclusivity negatively." },
  { id:"L-writing-011", type:"logic", domain:"writing", tier:"intermediate", timeLimit:12, title:"Evidence Evaluation", prompt:"A writer supports their claim with: 'According to a study, people who read more earn more.' Evaluate the evidential strength of this claim and what you'd need to know before using it.", constraint:"Must identify at least 4 questions you'd ask before accepting this evidence.", whatGoodLooksLike:"Causation direction, confounders, study quality, sample, definition of 'read more', publication bias — specific questions." },
  { id:"L-writing-012", type:"logic", domain:"writing", tier:"intermediate", timeLimit:12, title:"Persuasion Ethics", prompt:"Evaluate the ethical reasoning in: 'It's acceptable to use emotionally charged language in a persuasive piece as long as the underlying facts are accurate.' Is this argument sound?", constraint:"Identify what's valid and what's problematic about this position.", whatGoodLooksLike:"Accurate facts can still mislead. Framing effects. Emotional language can short-circuit rational evaluation. The 'as long as' qualifier does a lot of work here." },
  { id:"L-writing-013", type:"logic", domain:"writing", tier:"intermediate", timeLimit:12, title:"Readability Score Logic", prompt:"Evaluate: 'This document has a reading age of 14. Our target audience is senior executives, so this is too simple and needs to be made more complex.' Analyse this reasoning.", constraint:"Must explain what readability scores actually measure and what they don't.", whatGoodLooksLike:"Readability scores measure sentence/word complexity, not conceptual depth. Executives prefer clear writing. Complexity ≠ sophistication." },
  { id:"L-writing-014", type:"logic", domain:"writing", tier:"intermediate", timeLimit:12, title:"Revision Logic", prompt:"Evaluate this feedback on a draft: 'This is too short. All the best reports in our industry are at least 20 pages.' Analyse the logical structure of this feedback.", constraint:"Identify the reasoning error and explain what the actual evaluation criterion should be.", whatGoodLooksLike:"Appeal to industry norms. Length ≠ quality. The criterion should be: does it contain what it needs to contain?" },
  { id:"L-writing-015", type:"logic", domain:"writing", tier:"advanced", timeLimit:20, title:"Narrative Fallacy", prompt:"Explain Nassim Taleb's narrative fallacy and analyse how it affects the quality of business case studies as a learning tool. What are the implications for how case studies should be read and taught?", constraint:"Must address both the epistemological problem and the practical implication.", whatGoodLooksLike:"Narrative fallacy accurately explained. Survivorship bias in cases noted. Implications are specific." },
  { id:"L-writing-016", type:"logic", domain:"writing", tier:"advanced", timeLimit:20, title:"Evaluating an Op-Ed", prompt:"Choose a commonly-repeated claim in business, technology, or culture. Analyse its logical structure: what is the core claim, what evidence supports it, what assumptions does it rest on, and what would disprove it?", constraint:"Must cover all four elements. Must be a real, specific claim.", whatGoodLooksLike:"Claim is specific. Evidence evaluation is careful. Assumptions are unstated ones, not obvious ones. Disconfirming conditions are real." },
  { id:"L-writing-017", type:"logic", domain:"writing", tier:"advanced", timeLimit:20, title:"The Rhetoric/Dialectic Distinction", prompt:"Explain the distinction between rhetoric (persuasion) and dialectic (truth-seeking) in writing. Analyse a common form of professional writing that blurs this distinction problematically.", constraint:"The example must be specific — a genre, not a hypothetical instance.", whatGoodLooksLike:"Distinction is accurately drawn. The genre example is well-chosen and the analysis is specific." },
  { id:"L-writing-018", type:"logic", domain:"writing", tier:"advanced", timeLimit:20, title:"Stylistic Claim Evaluation", prompt:"Evaluate this prescriptive writing claim: 'You should never use the passive voice.' Analyse it as a logical argument: what is the implicit reasoning, what counter-examples exist, and what a more defensible version of the claim would be.", constraint:"Must construct a more defensible version, not just refute the original.", whatGoodLooksLike:"Implicit reasoning made explicit. Counter-examples are real and specific. More defensible version is actually more defensible, not just vague." },
  { id:"L-writing-019", type:"logic", domain:"writing", tier:"advanced", timeLimit:20, title:"The Clarity Paradox", prompt:"Analyse the claim: 'The best writing is invisible — when writing is truly clear, the reader doesn't notice the writing at all.' Is this logically coherent? What does it imply about the goals of different types of writing?", constraint:"Must address counter-examples where the writing being noticed is the point.", whatGoodLooksLike:"Coherence evaluated carefully. Counter-examples are real genres (poetry, literary fiction). Implication for different types is specific." },
  { id:"L-writing-020", type:"logic", domain:"writing", tier:"advanced", timeLimit:20, title:"AI and Authorship", prompt:"Evaluate the argument: 'Text generated by an AI with my prompts represents my ideas and intentions, therefore I am the author.' Analyse the logical and philosophical problems with this claim.", constraint:"Must engage with what 'authorship' actually requires, not just assert a position.", whatGoodLooksLike:"Authorship concept examined seriously. Intentionality, originality, cognitive contribution all addressed. Conclusion is nuanced." },
];

// ─── LOGIC × BUSINESS ─────────────────────────────────────────────────────────

const L_BUSINESS: BankTask[] = [
  { id:"L-business-001", type:"logic", domain:"business", tier:"beginner", timeLimit:8, title:"Vanity Metric Reasoning", prompt:"Evaluate: 'Our app has been downloaded 500,000 times. This proves it's successful and investors will be impressed.' Identify the logical problems.", constraint:"Must identify at least 3 distinct problems.", whatGoodLooksLike:"Downloads ≠ success. No active users mentioned. No retention, revenue, engagement. 'Investors will be impressed' assumes they use the same metric." },
  { id:"L-business-002", type:"logic", domain:"business", tier:"beginner", timeLimit:8, title:"Market Size Fallacy", prompt:"Evaluate: 'The global education market is worth $6 trillion. If we capture just 1% of it, we'll have $60 billion in revenue.' Identify what's wrong with this reasoning.", constraint:"Identify the specific fallacies and what a sound market analysis requires instead.", whatGoodLooksLike:"Top-down market sizing fallacy. 1% of a huge market means nothing without addressable market analysis. No path to that 1% described." },
  { id:"L-business-003", type:"logic", domain:"business", tier:"beginner", timeLimit:8, title:"Competitor Analysis Logic", prompt:"Evaluate: 'Our competitor raised $50 million. This means their model is validated and we should copy their approach.' Analyse the reasoning.", constraint:"Must identify at least 3 problems with this reasoning.", whatGoodLooksLike:"Funding ≠ validation. Copying follower is behind. Different cost structures. Funding reflects investor sentiment, not market validation." },
  { id:"L-business-004", type:"logic", domain:"business", tier:"beginner", timeLimit:8, title:"Pricing Logic", prompt:"Evaluate: 'Our product is better than the competitor's, so we should charge more.' Analyse this argument.", constraint:"Identify what's missing from this reasoning before making a pricing decision.", whatGoodLooksLike:"'Better' is subjective. Customer-perceived value ≠ actual capability difference. Price elasticity, positioning, switching costs — all missing." },
  { id:"L-business-005", type:"logic", domain:"business", tier:"beginner", timeLimit:8, title:"Hiring Reasoning", prompt:"Evaluate: 'This candidate went to a top university, so they must be capable.' Identify the logical problems with using this as the primary hiring criterion.", constraint:"Must identify both what it does and doesn't predict.", whatGoodLooksLike:"Correlation vs causation. Selection bias (who gets into top universities). Doesn't predict job performance specifically. What it does partially predict: certain signals of conscientiousness." },
  { id:"L-business-006", type:"logic", domain:"business", tier:"beginner", timeLimit:8, title:"Growth Logic", prompt:"Evaluate: 'We grew 300% last year. We'll easily grow another 300% this year because we have the same team and product.' Identify the logical errors.", constraint:"Must explain the base rate issue and at least 2 other problems.", whatGoodLooksLike:"Base rate — 300% on $100k ≠ 300% on $1M. Market saturation. Scaling challenges. Past growth explains past not future." },
  { id:"L-business-007", type:"logic", domain:"business", tier:"beginner", timeLimit:8, title:"Customer Feedback Logic", prompt:"Evaluate: 'We surveyed our top 20 customers and they all said they love the product. We don't need to worry about churn.' Identify the flaws in this reasoning.", constraint:"Must identify at least 3 problems.", whatGoodLooksLike:"Surveying top customers excludes churned customers. Satisfaction ≠ retention. Self-selection bias. Small sample from wrong segment." },
  { id:"L-business-008", type:"logic", domain:"business", tier:"intermediate", timeLimit:12, title:"Unit Economics Flaw", prompt:"Evaluate: 'Our CAC is $100 and our LTV is $120. The business is marginally profitable and will improve as we scale.' Identify the logical and financial problems with this reasoning.", constraint:"Must identify at least 4 specific issues.", whatGoodLooksLike:"$20 margin is too thin. Doesn't account for payback period. Fixed costs not addressed. Assumes LTV stays constant at scale. CAC tends to increase at scale." },
  { id:"L-business-009", type:"logic", domain:"business", tier:"intermediate", timeLimit:12, title:"Sunk Cost in Strategy", prompt:"Evaluate: 'We've invested $2 million in this product line over three years. We can't stop now — we need to see a return on that investment.' Identify the logical error and what the correct reasoning framework is.", constraint:"Must explain the sunk cost fallacy and the correct alternative.", whatGoodLooksLike:"Sunk cost fallacy accurately identified. Correct framework: future costs vs future expected returns only. Past investment is irrelevant to forward decision." },
  { id:"L-business-010", type:"logic", domain:"business", tier:"intermediate", timeLimit:12, title:"First-Mover Advantage", prompt:"Evaluate the argument: 'We need to move fast and be first to market. First-mover advantage is critical in our industry.' Analyse the logical strength of first-mover advantage as a general strategic principle.", constraint:"Must cite specific counter-examples and identify when it does and doesn't apply.", whatGoodLooksLike:"First-mover advantage is real in some contexts and a disadvantage in others. Late movers often win. Market education cost, technology lock-in, wrong assumptions." },
  { id:"L-business-011", type:"logic", domain:"business", tier:"intermediate", timeLimit:12, title:"Revenue Growth vs Profitability", prompt:"Evaluate: 'Our investors care about growth, not profitability. Therefore profitability is irrelevant at our stage.' Analyse the logic and identify the hidden assumptions.", constraint:"Must distinguish between legitimate stage-specific priorities and logical errors.", whatGoodLooksLike:"Legitimate growth-first thesis exists. But hidden assumption: growth will eventually convert to profit. And: investors care about growth now but will care about profitability later." },
  { id:"L-business-012", type:"logic", domain:"business", tier:"intermediate", timeLimit:12, title:"Selection Bias in Success Stories", prompt:"Evaluate: 'Amazon, Apple, and Google all moved fast and broke things early on. Therefore moving fast and breaking things is a strategy for success.' Identify the logical problems.", constraint:"Identify the primary fallacy by name and explain its mechanism here.", whatGoodLooksLike:"Survivorship bias. We don't see the fast-moving companies that failed. Correlation with success ≠ causation. Strategy may not transfer to different context." },
  { id:"L-business-013", type:"logic", domain:"business", tier:"intermediate", timeLimit:12, title:"Benchmarking Logic", prompt:"Evaluate: 'The industry average NPS is 35. Our NPS is 40. We're doing well and don't need to invest further in customer experience.' Analyse the reasoning.", constraint:"Must identify at least 4 problems with using this as a strategic conclusion.", whatGoodLooksLike:"Beating average ≠ good. Industry average is anchoring to low bar. NPS is a lagging indicator. Misses distribution of scores. Doesn't identify what drives the score." },
  { id:"L-business-014", type:"logic", domain:"business", tier:"intermediate", timeLimit:12, title:"Incentive Logic", prompt:"Evaluate: 'We'll fix our customer service problem by adding a bonus for support reps who resolve tickets quickly.' Analyse the likely consequences of this incentive structure.", constraint:"Must identify at least 3 second-order consequences.", whatGoodLooksLike:"Speed incentive → closes tickets without resolution. Goodhart's Law. Metric optimised at expense of actual goal. Gaming the KPI." },
  { id:"L-business-015", type:"logic", domain:"business", tier:"advanced", timeLimit:20, title:"Strategy vs Tactics", prompt:"Evaluate this commonly heard statement: 'We have a great strategy — we just need better execution.' Analyse the logical relationship between strategy and execution problems and why this statement is often a confusion.", constraint:"Must explain when execution problems are actually strategy problems.", whatGoodLooksLike:"An unexecutable strategy is a bad strategy. Distinguishes between strategy being wrong vs execution being underfunded/misaligned. Specific mechanisms." },
  { id:"L-business-016", type:"logic", domain:"business", tier:"advanced", timeLimit:20, title:"Platform Business Logic", prompt:"Analyse the logical structure of platform business models — specifically the claim that 'platforms are winner-take-all markets.' Under what conditions is this true, and when does it fail?", constraint:"Must give specific examples of multi-sided markets that are NOT winner-take-all and explain why.", whatGoodLooksLike:"Conditions for winner-take-all identified (strong network effects, no multi-homing). Counter-examples accurate. Analysis is structural." },
  { id:"L-business-017", type:"logic", domain:"business", tier:"advanced", timeLimit:20, title:"Disruption Theory", prompt:"Evaluate Clayton Christensen's disruption theory. Identify both what it explains well and where its predictive power has been found to be limited.", constraint:"Must include specific cases where the theory's predictions failed.", whatGoodLooksLike:"Theory accurately characterised. Real cases of misprediction cited. Honest about where the theory is strong." },
  { id:"L-business-018", type:"logic", domain:"business", tier:"advanced", timeLimit:20, title:"Growth at All Costs", prompt:"Evaluate the strategic logic of 'grow fast now, figure out the business model later.' Under what conditions is this rational, and when is it a rationalisation for poor thinking?", constraint:"Must distinguish between legitimate strategic logic and post-hoc rationalisation.", whatGoodLooksLike:"Legitimate conditions identified (network effects, land-grab windows). Distinguishes real strategic reasons from wishful thinking." },
  { id:"L-business-019", type:"logic", domain:"business", tier:"advanced", timeLimit:20, title:"Talent Over Process", prompt:"Evaluate the argument: 'Great companies don't need processes — they just hire great people and get out of their way.' Analyse the logical validity and identify the conditions under which it holds.", constraint:"Must identify specific failure modes of this philosophy at scale.", whatGoodLooksLike:"Has validity at small scale with right people. Specific failure modes at scale: coordination, knowledge transfer, quality consistency. Not 'it just doesn't work'." },
  { id:"L-business-020", type:"logic", domain:"business", tier:"advanced", timeLimit:20, title:"Moat Analysis", prompt:"Evaluate this competitive claim: 'Our brand is our moat.' Analyse the logical strength of brand as a competitive moat — when it's a genuine moat and when it's a false sense of security.", constraint:"Must include specific examples of brands that lost their moat and why.", whatGoodLooksLike:"Brand as moat is real in specific conditions. Examples of brand erosion are accurate and analysed. What creates and destroys brand moat is specific." },
];

// ─── LOGIC × COMMUNICATION ────────────────────────────────────────────────────

const L_COMMUNICATION: BankTask[] = [
  { id:"L-comm-001", type:"logic", domain:"communication", tier:"beginner", timeLimit:8, title:"The Miscommunication", prompt:"Analyse: 'I said it clearly — if they didn't understand it, that's their problem.' Identify the logical error in this view of communication responsibility.", constraint:"Explain what communication actually requires of the sender.", whatGoodLooksLike:"Communication is a two-way process. Sender is responsible for checking understanding. 'Clearly' is self-assessed. The goal is for the receiver to understand." },
  { id:"L-comm-002", type:"logic", domain:"communication", tier:"beginner", timeLimit:8, title:"Feedback Logic", prompt:"Evaluate: 'I gave her feedback last month and she hasn't changed. Clearly she doesn't want to improve.' Identify the logical gaps in this conclusion.", constraint:"Must identify at least 3 alternative explanations.", whatGoodLooksLike:"Feedback may not have been clear. Change takes time. May not have been actionable. She may be improving in ways not yet visible. Observer bias." },
  { id:"L-comm-003", type:"logic", domain:"communication", tier:"beginner", timeLimit:8, title:"Tone Policing", prompt:"Evaluate: 'The way you raised that concern was too aggressive, so I can't take the concern seriously.' Analyse the logical validity of this response.", constraint:"Distinguish between what's legitimately about tone and what's an error in reasoning.", whatGoodLooksLike:"Tone is relevant to how something lands. But dismissing the content because of tone is a logical error. Distinguishes tone policing as deflection from legitimate feedback on delivery." },
  { id:"L-comm-004", type:"logic", domain:"communication", tier:"beginner", timeLimit:8, title:"Silence as Agreement", prompt:"Evaluate: 'Nobody objected in the meeting, so everyone agrees with the decision.' Identify the flaws in this reasoning.", constraint:"Must identify at least 3 reasons why silence doesn't indicate agreement.", whatGoodLooksLike:"Power dynamics suppress dissent. People may not have understood the implications. Preference to raise concerns privately. HIPPO effect." },
  { id:"L-comm-005", type:"logic", domain:"communication", tier:"beginner", timeLimit:8, title:"Intent vs Impact", prompt:"Evaluate: 'I didn't mean to offend anyone, so they shouldn't be offended.' Analyse the logical structure of this argument.", constraint:"Must address what intent does and doesn't cover in communication ethics.", whatGoodLooksLike:"Intent doesn't determine impact. Both matter, but for different things. Intent is relevant for judging the person, impact is what needs to be addressed." },
  { id:"L-comm-006", type:"logic", domain:"communication", tier:"beginner", timeLimit:8, title:"Over-Communication Reasoning", prompt:"Evaluate: 'To avoid misunderstandings, we should over-communicate and share everything with everyone.' Identify the logical problems with this as a communication strategy.", constraint:"Must identify at least 3 problems, including one about attention and cognitive load.", whatGoodLooksLike:"Information overload reduces signal. Relevant vs irrelevant information distinction is lost. Decision paralysis. Over-communication can signal lack of trust." },
  { id:"L-comm-007", type:"logic", domain:"communication", tier:"beginner", timeLimit:8, title:"The Meeting Default", prompt:"Evaluate: 'We need to solve this complex problem, so let's call a meeting.' Analyse the reasoning behind defaulting to meetings for complex problems.", constraint:"Must identify when a meeting is the right tool and when it isn't.", whatGoodLooksLike:"Meetings are for discussion and decision-making, not problem-solving. Complex problems may need async thinking first. Identifies when meetings are the right tool." },
  { id:"L-comm-008", type:"logic", domain:"communication", tier:"intermediate", timeLimit:12, title:"Framing Effects", prompt:"Analyse the logical and psychological effect of framing in this pair: 'This surgery has a 90% survival rate' vs 'This surgery has a 10% mortality rate.' Both are factually identical. What does this reveal about rational decision-making?", constraint:"Must address what it implies for how information should ethically be presented.", whatGoodLooksLike:"Framing effect accurately explained. Rational decision-making should be frame-independent but isn't. Ethical implication is specific." },
  { id:"L-comm-009", type:"logic", domain:"communication", tier:"intermediate", timeLimit:12, title:"Escalation Logic", prompt:"Evaluate: 'Every time someone comes to me with a problem instead of solving it themselves, I tell them to figure it out. This will make them more capable.' Analyse the reasoning.", constraint:"Must identify when this approach is valid and when it fails.", whatGoodLooksLike:"Valid for problems within their capability. Fails when they genuinely need guidance. Creates learned helplessness or disengagement in some contexts. Distinguishes capability from authority." },
  { id:"L-comm-010", type:"logic", domain:"communication", tier:"intermediate", timeLimit:12, title:"Transparency Argument", prompt:"Evaluate: 'Radical transparency — sharing all information with all employees — creates trust and better decision-making.' Analyse the logical claims in this argument.", constraint:"Must address both what's valid and what's problematic.", whatGoodLooksLike:"Transparency does build trust in some contexts. But: information overload, context without interpretation misleads, competitive information, legal constraints. Not all information is equally useful to all people." },
  { id:"L-comm-011", type:"logic", domain:"communication", tier:"intermediate", timeLimit:12, title:"Blame Analysis", prompt:"After a failed project, the team concludes: 'The project failed because there was poor communication.' Evaluate the logical adequacy of this as a root cause.", constraint:"Must explain why 'poor communication' is rarely a satisfying root cause and what it usually conceals.", whatGoodLooksLike:"'Poor communication' is a symptom, not a cause. What specifically wasn't communicated? Why? What was the underlying misalignment? This analysis stops one level too early." },
  { id:"L-comm-012", type:"logic", domain:"communication", tier:"intermediate", timeLimit:12, title:"The Apology Argument", prompt:"Evaluate: 'A good apology always includes an explanation of what caused the problem, so the person knows it won't happen again.' Analyse when this is true and when it undermines the apology.", constraint:"Must give specific examples of when explanation helps and when it hurts.", whatGoodLooksLike:"Explanation can be valuable. But: it can come across as excuse-making, shift focus from impact to intent, delay the acknowledgement. Timing matters." },
  { id:"L-comm-013", type:"logic", domain:"communication", tier:"intermediate", timeLimit:12, title:"Presentation Logic", prompt:"Evaluate: 'If your slides are clear enough, you don't need to practise the presentation — the content speaks for itself.' Identify the logical errors.", constraint:"Must explain what presentation skills add that clear slides cannot.", whatGoodLooksLike:"Slides are a support, not the presentation. Delivery affects credibility, emphasis, timing, handling questions. The argument conflates the content with the communication." },
  { id:"L-comm-014", type:"logic", domain:"communication", tier:"intermediate", timeLimit:12, title:"Email vs Meeting Reasoning", prompt:"Someone argues: 'Complex decisions should always be made in meetings, not over email, because email doesn't allow for real-time discussion.' Analyse the logic.", constraint:"Must identify when async written communication is actually superior for complex decisions.", whatGoodLooksLike:"Real-time isn't always better. Writing forces clarity. Async allows reflection. Dominant voices don't control outcomes. Written record exists. Not 'email is always better' but a genuine analysis." },
  { id:"L-comm-015", type:"logic", domain:"communication", tier:"advanced", timeLimit:20, title:"Organisational Silence", prompt:"Analyse the phenomenon of 'organisational silence' — when employees know important information but don't share it upward. Identify the structural and psychological mechanisms that cause it, and evaluate proposed solutions.", constraint:"Must analyse why common proposed solutions (open door policy, anonymous feedback) often fail.", whatGoodLooksLike:"Mechanisms are specific. Proposed solutions' failure is explained structurally, not just asserted." },
  { id:"L-comm-016", type:"logic", domain:"communication", tier:"advanced", timeLimit:20, title:"Persuasion and Manipulation", prompt:"Construct the clearest possible logical distinction between persuasion and manipulation in communication. Then identify cases that fall in the grey zone and explain what makes them ambiguous.", constraint:"Grey zone cases must be real and genuinely ambiguous.", whatGoodLooksLike:"Distinction is principled (e.g. based on informed consent, accuracy, rationality). Grey zone cases are real. Analysis doesn't pretend the distinction is always clear." },
  { id:"L-comm-017", type:"logic", domain:"communication", tier:"advanced", timeLimit:20, title:"Cultural Communication Logic", prompt:"Evaluate this claim: 'High-context communication is less efficient than low-context communication in professional settings.' Analyse the logical assumptions embedded in the word 'efficient' and what the claim obscures.", constraint:"Must define 'efficient' precisely and show how different definitions change the conclusion.", whatGoodLooksLike:"'Efficient' interrogated carefully. Definition reveals value judgements. What high-context communication achieves that low-context misses." },
  { id:"L-comm-018", type:"logic", domain:"communication", tier:"advanced", timeLimit:20, title:"The Deep Work Argument", prompt:"Evaluate Cal Newport's argument that deep work is becoming increasingly rare and increasingly valuable. Identify what the argument assumes, what evidence it relies on, and where it might be challenged.", constraint:"Must be a genuine evaluation — engage with the strongest version of the argument before identifying weaknesses.", whatGoodLooksLike:"Argument steelmanned first. Assumptions made explicit. Weaknesses are substantive, not trivial." },
  { id:"L-comm-019", type:"logic", domain:"communication", tier:"advanced", timeLimit:20, title:"The Meeting Cost Argument", prompt:"Evaluate the commonly-cited argument that 'most meetings are a waste of time and should be replaced with written communication.' Analyse the logical structure, the evidence used to support it, and what it misses.", constraint:"Must identify what meetings achieve that asynchronous communication structurally cannot.", whatGoodLooksLike:"Argument's evidence examined critically. What meetings achieve is specific and structural (real-time negotiation, building relational trust, rapid iteration)." },
  { id:"L-comm-020", type:"logic", domain:"communication", tier:"advanced", timeLimit:20, title:"Feedback Culture Logic", prompt:"Evaluate: 'If we build a culture where all feedback is welcome and no one takes it personally, our organisation will continuously improve.' Analyse the logical and psychological assumptions in this claim.", constraint:"Must identify at least 4 specific assumptions and evaluate each.", whatGoodLooksLike:"Four assumptions identified and evaluated separately. Recognises that some interpersonal sensitivity is functional, not a flaw. Continuous improvement has structural limits." },
];

// ─── LOGIC × ANALYTICAL ───────────────────────────────────────────────────────

const L_ANALYTICAL: BankTask[] = [
  { id:"L-analytical-001", type:"logic", domain:"analytical", tier:"beginner", timeLimit:8, title:"Identify the Bias", prompt:"Evaluate: 'I've noticed that every time I wash my car, it rains the next day. My car washing must be causing rain.' Identify the cognitive bias and explain its mechanism.", constraint:"Name the bias precisely and explain why our brains produce this error.", whatGoodLooksLike:"Illusory correlation / confirmation bias. Mechanism: we notice confirming instances more than disconfirming ones. The asymmetry in attention." },
  { id:"L-analytical-002", type:"logic", domain:"analytical", tier:"beginner", timeLimit:8, title:"Post Hoc Reasoning", prompt:"Evaluate: 'After we changed our logo, sales went up 20%. The new logo is working.' What is wrong with this causal claim?", constraint:"Name the fallacy and explain what evidence would be needed to establish the causal link.", whatGoodLooksLike:"Post hoc ergo propter hoc. Temporal sequence ≠ causation. Needs: controlled test, ruling out confounders, mechanism." },
  { id:"L-analytical-003", type:"logic", domain:"analytical", tier:"beginner", timeLimit:8, title:"False Equivalence", prompt:"Evaluate: 'Scientists disagree about the exact rate of sea level rise, so we can't be sure climate change is real.' Identify the logical error.", constraint:"Explain what the disagreement among scientists actually tells us vs what the argument claims it tells us.", whatGoodLooksLike:"False equivalence between uncertainty about specific quantity and uncertainty about the phenomenon. Expert disagreement on details ≠ disagreement on fundamentals." },
  { id:"L-analytical-004", type:"logic", domain:"analytical", tier:"beginner", timeLimit:8, title:"Availability Heuristic", prompt:"Evaluate: 'Flying must be dangerous — I can easily think of several plane crashes.' Identify the cognitive mechanism and explain how it distorts probability assessments.", constraint:"Must explain the availability heuristic specifically and give a counter-example of how it distorts perception in the opposite direction.", whatGoodLooksLike:"Availability heuristic accurately described. Counter-example: common but unspectacular risks (car accidents) underestimated because they're not memorable." },
  { id:"L-analytical-005", type:"logic", domain:"analytical", tier:"beginner", timeLimit:8, title:"The Expert Problem", prompt:"Evaluate: 'This person is a Nobel Prize winner in physics, so their views on economics should be taken seriously.' Identify the reasoning error.", constraint:"Must explain when expertise does and doesn't transfer across domains.", whatGoodLooksLike:"Domain expertise doesn't transfer automatically. Nobel Prize in physics ≠ economic expertise. Halo effect. Expertise is domain-specific." },
  { id:"L-analytical-006", type:"logic", domain:"analytical", tier:"beginner", timeLimit:8, title:"Anchoring Bias", prompt:"Explain the anchoring bias and give a realistic example of how it could affect a professional decision. Then explain what you can do to mitigate it.", constraint:"Example must be professional and specific. Mitigation must be practical.", whatGoodLooksLike:"Anchoring accurately explained. Example is realistic. Mitigation is specific (pre-commit to criteria before seeing anchor, seek independent estimates)." },
  { id:"L-analytical-007", type:"logic", domain:"analytical", tier:"beginner", timeLimit:8, title:"Overconfidence Analysis", prompt:"Evaluate: 'I'm confident this project will take 3 months. I've done similar projects before and I know what I'm doing.' Identify the cognitive bias at play and what evidence suggests about human accuracy in project estimation.", constraint:"Name the specific bias. Must reference the planning fallacy.", whatGoodLooksLike:"Overconfidence and planning fallacy identified. Evidence: people systematically underestimate time even when they know about the bias. Even experts." },
  { id:"L-analytical-008", type:"logic", domain:"analytical", tier:"intermediate", timeLimit:12, title:"Regression to the Mean", prompt:"Analyse this business reasoning: 'Our worst-performing sales rep last quarter became our best performer this quarter after we sent her to a training programme. The training clearly worked.' What is the logical problem?", constraint:"Must explain regression to the mean and how it applies here.", whatGoodLooksLike:"Regression to the mean accurately explained. The performance extremes are more likely due to random variation. Training effect vs natural regression cannot be separated without a control group." },
  { id:"L-analytical-009", type:"logic", domain:"analytical", tier:"intermediate", timeLimit:12, title:"Base Rate Neglect", prompt:"A test for a disease is 99% accurate. The disease affects 1 in 1,000 people. You test positive. What is the probability you have the disease? Show your reasoning. Then explain why this matters for how we should interpret diagnostic tests.", constraint:"Must show the actual calculation. Must explain the practical implication.", whatGoodLooksLike:"Calculation is correct (~9%). Base rate neglect explained. Practical implication: positive tests on rare conditions require confirmation." },
  { id:"L-analytical-010", type:"logic", domain:"analytical", tier:"intermediate", timeLimit:12, title:"The Map and the Territory", prompt:"Explain Korzybski's 'the map is not the territory' principle. Then analyse a specific professional situation where confusing the model with the reality it represents caused or could cause a significant error.", constraint:"Must give a specific professional example.", whatGoodLooksLike:"Principle accurately explained. Example is specific and illustrative. The confusion mechanism is clear." },
  { id:"L-analytical-011", type:"logic", domain:"analytical", tier:"intermediate", timeLimit:12, title:"Inductive Reasoning Limits", prompt:"Explain the problem of induction as identified by Hume. Then give a specific example from business or technology where relying on inductive reasoning from past data failed badly.", constraint:"Example must be real and specific.", whatGoodLooksLike:"Hume's problem accurately described. Real example is appropriate (2008 financial crisis models, etc.). The failure mechanism is connected to the philosophical problem." },
  { id:"L-analytical-012", type:"logic", domain:"analytical", tier:"intermediate", timeLimit:12, title:"Motivated Reasoning", prompt:"Explain motivated reasoning and distinguish it from confirmation bias. Give a specific professional example of each, and describe what structural conditions make motivated reasoning more likely.", constraint:"Distinction between motivated reasoning and confirmation bias must be clear.", whatGoodLooksLike:"Distinction is accurate (motivated reasoning starts from conclusion; confirmation bias is a processing bias). Examples are clear. Structural conditions are specific." },
  { id:"L-analytical-013", type:"logic", domain:"analytical", tier:"intermediate", timeLimit:12, title:"Category Error", prompt:"Identify and explain the category error in the following: 'This company has a strategy problem, not a talent problem. If we fix the strategy, the talent will follow.' Then explain what a category error is in general.", constraint:"Must define category error precisely before applying it.", whatGoodLooksLike:"Category error defined accurately. The strategy/talent dichotomy is identified as a false binary — they're not mutually exclusive categories." },
  { id:"L-analytical-014", type:"logic", domain:"analytical", tier:"intermediate", timeLimit:12, title:"Survivorship Bias in Advice", prompt:"Analyse how survivorship bias affects business and career advice. Give two specific examples of widely-given advice that looks compelling because of survivorship bias but may be misleading.", constraint:"Examples must be specific pieces of advice, not general categories.", whatGoodLooksLike:"Two specific pieces of advice identified. Survivorship bias mechanism explained for each. What the full sample would show is described." },
  { id:"L-analytical-015", type:"logic", domain:"analytical", tier:"advanced", timeLimit:20, title:"The Limits of Data", prompt:"Construct the strongest possible argument that over-reliance on data and metrics in decision-making is itself a form of irrationality. Identify what data cannot capture and when qualitative judgement is epistemically superior.", constraint:"Must be a genuine argument, not just 'not everything can be measured'. Must be specific.", whatGoodLooksLike:"Genuine argument: Goodhart's Law, Campbell's Law, what matters resists quantification, measurement creates incentives that distort the thing measured." },
  { id:"L-analytical-016", type:"logic", domain:"analytical", tier:"advanced", timeLimit:20, title:"Counterfactual Reasoning", prompt:"Explain counterfactual reasoning — why it matters for causal inference — and identify a major public policy or business decision in recent history where the failure to reason counterfactually led to a wrong conclusion.", constraint:"Historical case must be real and specific. The counterfactual must be clearly stated.", whatGoodLooksLike:"Counterfactual reasoning accurately explained. Real case identified. The counterfactual is specific — what would have happened under the alternative." },
  { id:"L-analytical-017", type:"logic", domain:"analytical", tier:"advanced", timeLimit:20, title:"The Rationality Debate", prompt:"Evaluate the claim that human decision-making is fundamentally irrational. Identify what the evidence actually shows, what it doesn't show, and what 'rational' even means in this debate.", constraint:"Must define 'rational' carefully before evaluating the claim.", whatGoodLooksLike:"'Rational' interrogated — rational by what standard, for what purpose. Evidence is accurate. Conclusion is nuanced about what the biases literature shows." },
  { id:"L-analytical-018", type:"logic", domain:"analytical", tier:"advanced", timeLimit:20, title:"Replication Crisis", prompt:"Explain the replication crisis in social science research. Analyse its causes, its implications for how we should use social science findings in professional decision-making, and what a more epistemically healthy relationship to social science would look like.", constraint:"Must give specific examples of high-profile findings that failed to replicate.", whatGoodLooksLike:"Crisis accurately described. Causes specific (p-hacking, publication bias, etc.). Named examples accurate. Implications are practical." },
  { id:"L-analytical-019", type:"logic", domain:"analytical", tier:"advanced", timeLimit:20, title:"Epistemic Humility vs Decisiveness", prompt:"Construct the strongest possible argument that epistemic humility — acknowledging uncertainty and the limits of your knowledge — is fundamentally at odds with decisive leadership. Then refute your own argument.", constraint:"Both the argument and the refutation must be genuine and specific.", whatGoodLooksLike:"Argument is genuinely strong. Refutation addresses it directly, not a different argument. The tension is real even if not irresolvable." },
  { id:"L-analytical-020", type:"logic", domain:"analytical", tier:"advanced", timeLimit:20, title:"Your Analytical Blind Spot", prompt:"Analyse a domain where your own analytical thinking is systematically weaker or more biased than in areas you're confident in. What is the mechanism of your blind spot, and what have you done (or could do) to compensate for it?", constraint:"Must be specific and honest. The mechanism must be proposed, not just the observation.", whatGoodLooksLike:"Specific blind spot identified. Mechanism is proposed, not just 'I'm not good at this'. Compensation strategy is concrete." },
];

// ─── EXPORT ───────────────────────────────────────────────────────────────────

export const TASK_BANK: BankTask[] = [
  ...W_TECH, ...W_WRITING, ...W_BUSINESS, ...W_COMMUNICATION, ...W_ANALYTICAL,
  ...R_TECH, ...R_WRITING, ...R_BUSINESS, ...R_COMMUNICATION, ...R_ANALYTICAL,
  ...L_TECH, ...L_WRITING, ...L_BUSINESS, ...L_COMMUNICATION, ...L_ANALYTICAL,
];

// Domain inference from onboarding profile
// Maps behaviors + rustySkill → 2 primary domains

const BEHAVIOR_DOMAIN_MAP: Record<string, TaskDomain> = {
  "Debug or fix my code":                   "tech",
  "Write code I could figure out myself":   "tech",
  "Write or rewrite my emails / messages":  "writing",
  "Draft content — posts, reports, proposals": "writing",
  "Proofread or improve my writing":        "writing",
  "Help me make a decision":                "business",
  "Plan or structure my thinking":          "business",
  "Summarize a document or article":        "communication",
  "Explain a concept I don't fully understand": "communication",
  "Answer questions I haven't tried to answer first": "communication",
  "Break down a complex problem":           "analytical",
  "Search for information I should probably know": "analytical",
  "Generate ideas when I'm stuck":          "analytical",
  "Do mental math or quick calculations":   "analytical",
};

const RUSTY_DOMAIN_MAP: Record<string, TaskDomain> = {
  "Writing from scratch":         "writing",
  "Problem solving step by step": "analytical",
  "Memory and recall":            "analytical",
  "Critical thinking":            "analytical",
  "Making decisions confidently": "business",
  "Spelling and grammar":         "writing",
  "Mental math":                  "analytical",
  "All of it, honestly":          "communication",
};

const ALL_DOMAINS: TaskDomain[] = ["tech", "writing", "business", "communication", "analytical"];

export function inferDomains(behaviors: string[], rustySkill: string): [TaskDomain, TaskDomain] {
  const counts: Record<TaskDomain, number> = { tech:0, writing:0, business:0, communication:0, analytical:0 };

  behaviors.forEach(b => {
    const d = BEHAVIOR_DOMAIN_MAP[b];
    if (d) counts[d]++;
  });

  const rustyDomain = RUSTY_DOMAIN_MAP[rustySkill];
  if (rustyDomain) counts[rustyDomain] += 2; // rustySkill weighted more

  const sorted = (Object.entries(counts) as [TaskDomain, number][])
    .sort((a, b) => b[1] - a[1]);

  const primary = sorted[0][0];
  const secondary = sorted[1][0] !== primary ? sorted[1][0] : sorted[2][0];

  return [primary, secondary];
}

export function getVarietyDomain(primary: TaskDomain, secondary: TaskDomain): TaskDomain {
  const others = ALL_DOMAINS.filter(d => d !== primary && d !== secondary);
  return others[Math.floor(Math.random() * others.length)];
}