// Customer-facing text for the voice widget, in English and Urdu.
// Terms (see PRODUCT.md): "conversation" (never call/session), "microphone",
// "tap", "your reference". Urdu avoids gendered verbs where it can, because
// the agent's name and persona vary by tenant.

import type { ErrorKind, Phase } from '@/types'

export type UiLang = 'en' | 'ur'

export interface WidgetCopy {
  status: (phase: Phase, agent: string) => string
  hint: { speak: string; send: string; interrupt: string; micOff: string }
  aria: { record: string; stopAndSend: string; interrupt: string; end: string; urdu: string; english: string }
  closeCue: string
  typeInstead: string
  typePlaceholder: string
  typeLabel: string
  send: string
  conversation: string
  emptyTitle: string
  emptyBody: string
  timeLeft: string
  end: string
  errors: Record<ErrorKind, string>
  idle: { title: string; body: (secs: number) => string; stay: string; restart: string }
  endConfirm: { title: string; body: string; keep: string; end: string }
  saving: { title: string; body: string; slowTitle: string; slowBody: string }
  failed: { title: string; staff: string; retry: string }
  done: { title: string; body: string; reference: string; referenceNote: string; keep: string; resetIn: (s: number) => string; stays: string }
  newConversation: string
  unconfigured: { title: string; body: string }
}

export const COPY: Record<UiLang, WidgetCopy> = {
  en: {
    status: (phase, agent) => {
      switch (phase) {
        case 'connecting':   return 'Getting ready…'
        case 'idle':         return 'Tap the microphone and start talking'
        case 'listening':    return 'Listening…'
        case 'transcribing': return 'Catching what you said…'
        case 'thinking':     return `${agent} is thinking…`
        case 'speaking':     return `${agent} is speaking`
        case 'ended':        return 'Thank you'
        case 'error':        return 'Something went wrong'
      }
    },
    hint: { speak: 'Tap to speak', send: 'Tap to send', interrupt: 'Tap to speak now', micOff: 'Microphone unavailable' },
    aria: { record: 'Start recording', stopAndSend: 'Stop recording and send', interrupt: 'Stop the reply and speak', end: 'End conversation', urdu: 'Urdu', english: 'English' },
    closeCue: 'Say goodbye when you are done',
    typeInstead: 'Type instead',
    typePlaceholder: 'Type your message',
    typeLabel: 'Type your message',
    send: 'Send',
    conversation: 'Conversation',
    emptyTitle: 'Your conversation will appear here',
    emptyBody: 'Tap the microphone and speak naturally.',
    timeLeft: 'left to speak',
    end: 'End',
    errors: {
      mic:     'The microphone is not working. Please type your message below, or ask a member of staff.',
      network: 'We lost the connection. Please try again in a moment.',
      limit:   'The service is busy right now. Please try again in a minute.',
      save:    'Your conversation ended, but we could not save it. Please try again.',
      general: 'Something went wrong on our side. Please try again.',
    },
    idle: {
      title: 'Are you still there?',
      body: (s) => `To keep the next customer’s conversation private, this screen resets in ${s} seconds.`,
      stay: 'I’m still here',
      restart: 'Start over',
    },
    endConfirm: {
      title: 'End the conversation now?',
      body: 'We have not fully understood your feedback yet, so it may not reach the right team.',
      keep: 'Keep talking',
      end: 'End conversation',
    },
    saving: { title: 'Saving your conversation…', body: 'This only takes a moment.', slowTitle: 'Still saving…', slowBody: 'This is taking longer than usual. Please wait a moment.' },
    failed: { title: 'Not saved yet', staff: 'If it keeps failing, please tell a member of staff.', retry: 'Try again' },
    done: {
      title: 'Thank you',
      body: 'Your feedback has reached our team.',
      reference: 'Your reference',
      referenceNote: 'Our team may use it to follow up with you.',
      keep: 'Keep this screen',
      resetIn: (s) => `A new conversation starts in ${s}s`,
      stays: 'This screen stays until you start a new conversation.',
    },
    newConversation: 'Start a new conversation',
    unconfigured: { title: 'This device is not set up yet', body: 'No shop is assigned to this device. Ask your manager to assign one, then sign in again.' },
  },
  ur: {
    status: (phase) => {
      switch (phase) {
        case 'connecting':   return 'تیاری ہو رہی ہے…'
        case 'idle':         return 'مائیکروفون دبائیں اور بات شروع کریں'
        case 'listening':    return 'سنا جا رہا ہے…'
        case 'transcribing': return 'آپ کی بات سمجھی جا رہی ہے…'
        case 'thinking':     return 'جواب تیار ہو رہا ہے…'
        case 'speaking':     return 'جواب سنیں'
        case 'ended':        return 'شکریہ'
        case 'error':        return 'کچھ غلط ہو گیا'
      }
    },
    hint: { speak: 'بولنے کے لیے دبائیں', send: 'بھیجنے کے لیے دبائیں', interrupt: 'ابھی بولنے کے لیے دبائیں', micOff: 'مائیکروفون دستیاب نہیں' },
    aria: { record: 'ریکارڈنگ شروع کریں', stopAndSend: 'ریکارڈنگ روک کر بھیجیں', interrupt: 'جواب روک کر بولیں', end: 'گفتگو ختم کریں', urdu: 'اردو', english: 'انگریزی' },
    closeCue: 'بات ختم ہو جائے تو خدا حافظ کہیں',
    typeInstead: 'لکھ کر بتائیں',
    typePlaceholder: 'اپنا پیغام لکھیں',
    typeLabel: 'اپنا پیغام لکھیں',
    send: 'بھیجیں',
    conversation: 'گفتگو',
    emptyTitle: 'آپ کی گفتگو یہاں نظر آئے گی',
    emptyBody: 'مائیکروفون دبائیں اور آرام سے بات کریں۔',
    timeLeft: 'بولنے کا وقت باقی',
    end: 'ختم',
    errors: {
      mic:     'مائیکروفون کام نہیں کر رہا۔ براہ کرم نیچے اپنا پیغام لکھیں، یا عملے کے کسی رکن سے مدد لیں۔',
      network: 'رابطہ منقطع ہو گیا۔ براہ کرم تھوڑی دیر میں دوبارہ کوشش کریں۔',
      limit:   'سروس اس وقت مصروف ہے۔ براہ کرم ایک منٹ بعد دوبارہ کوشش کریں۔',
      save:    'گفتگو ختم ہو گئی، لیکن ہم اسے محفوظ نہیں کر سکے۔ براہ کرم دوبارہ کوشش کریں۔',
      general: 'ہماری طرف سے کچھ غلط ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔',
    },
    idle: {
      title: 'کیا آپ ابھی موجود ہیں؟',
      body: (s) => `اگلے گاہک کی گفتگو محفوظ رکھنے کے لیے یہ اسکرین ${s} سیکنڈ میں دوبارہ شروع ہو جائے گی۔`,
      stay: 'میں موجود ہوں',
      restart: 'دوبارہ شروع کریں',
    },
    endConfirm: {
      title: 'کیا گفتگو ابھی ختم کریں؟',
      body: 'ہم ابھی آپ کی بات پوری طرح نہیں سمجھ سکے، اس لیے یہ صحیح ٹیم تک نہ پہنچے۔',
      keep: 'بات جاری رکھیں',
      end: 'گفتگو ختم کریں',
    },
    saving: { title: 'آپ کی گفتگو محفوظ ہو رہی ہے…', body: 'بس ایک لمحہ۔', slowTitle: 'ابھی محفوظ ہو رہی ہے…', slowBody: 'معمول سے زیادہ وقت لگ رہا ہے۔ براہ کرم تھوڑا انتظار کریں۔' },
    failed: { title: 'ابھی محفوظ نہیں ہوئی', staff: 'اگر مسئلہ برقرار رہے تو عملے کے کسی رکن کو بتائیں۔', retry: 'دوبارہ کوشش کریں' },
    done: {
      title: 'شکریہ',
      body: 'آپ کی رائے ہماری ٹیم تک پہنچ گئی ہے۔',
      reference: 'آپ کا حوالہ نمبر',
      referenceNote: 'ہماری ٹیم اسی کے ذریعے آپ سے رابطہ کر سکتی ہے۔',
      keep: 'یہ اسکرین رکھیں',
      resetIn: (s) => `نئی گفتگو ${s} سیکنڈ میں شروع ہو گی`,
      stays: 'یہ اسکرین نئی گفتگو شروع ہونے تک رہے گی۔',
    },
    newConversation: 'نئی گفتگو شروع کریں',
    unconfigured: { title: 'یہ ڈیوائس ابھی سیٹ اپ نہیں ہوئی', body: 'اس ڈیوائس کے ساتھ کوئی دکان منسلک نہیں۔ اپنے مینیجر سے کہیں کہ دکان منسلک کریں، پھر دوبارہ سائن اِن کریں۔' },
  },
}

export const uiLangFor = (language: string): UiLang => (language.toLowerCase() === 'urdu' ? 'ur' : 'en')
