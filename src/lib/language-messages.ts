/**
 * Language Messages for Multilingual UI
 * Auto-detect browser language and show welcome message
 */

export const LANGUAGE_MESSAGES: Record<string, string> = {
    // Spanish
    'es': '¡Escribe tus prompts en Español! Optimizaremos todo en tu idioma.',
    // Portuguese
    'pt': 'Escreva seus prompts em Português! Vamos otimizar no seu idioma.',
    // French
    'fr': 'Écrivez vos prompts en Français ! Nous optimiserons dans votre langue.',
    // German
    'de': 'Schreiben Sie Ihre Prompts auf Deutsch! Wir optimieren in Ihrer Sprache.',
    // Italian
    'it': 'Scrivi i tuoi prompt in Italiano! Ottimizzeremo nella tua lingua.',
    // Dutch
    'nl': 'Schrijf je prompts in het Nederlands! We optimaliseren in jouw taal.',
    // Russian
    'ru': 'Пишите промпты на Русском! Мы оптимизируем на вашем языке.',
    // Japanese
    'ja': '日本語でプロンプトを書いてください！あなたの言語で最適化します。',
    // Korean
    'ko': '한국어로 프롬프트를 작성하세요! 귀하의 언어로 최적화해 드립니다.',
    // Chinese (Simplified)
    'zh': '用中文写您的提示！我们将用您的语言进行优化。',
    // Arabic
    'ar': 'اكتب طلباتك بالعربية! سنقوم بالتحسين بلغتك.',
    // Hindi
    'hi': 'अपने प्रॉम्प्ट हिंदी में लिखें! हम आपकी भाषा में अनुकूलित करेंगे।',
    // Turkish
    'tr': 'Promptlarınızı Türkçe yazın! Dilinizde optimize edeceğiz.',
    // Polish
    'pl': 'Pisz prompty po Polsku! Zoptymalizujemy w Twoim języku.',
    // Vietnamese
    'vi': 'Viết prompt bằng Tiếng Việt! Chúng tôi sẽ tối ưu hóa bằng ngôn ngữ của bạn.',
    // Thai
    'th': 'เขียน prompt เป็นภาษาไทย! เราจะเพิ่มประสิทธิภาพในภาษาของคุณ',
    // Indonesian
    'id': 'Tulis prompt dalam Bahasa Indonesia! Kami akan mengoptimalkan dalam bahasa Anda.',
    // Swedish
    'sv': 'Skriv dina prompts på Svenska! Vi optimerar på ditt språk.',
    // Czech
    'cs': 'Pište prompty v Češtině! Optimalizujeme ve vašem jazyce.',
    // Greek
    'el': 'Γράψτε τα prompts σας στα Ελληνικά! Θα βελτιστοποιήσουμε στη γλώσσα σας.',
    // Hebrew
    'he': 'כתוב את הפרומפטים שלך בעברית! נמטב בשפה שלך.',
    // Romanian
    'ro': 'Scrieți prompturile în Română! Vom optimiza în limba dumneavoastră.',
    // Ukrainian
    'uk': 'Пишіть промпти Українською! Ми оптимізуємо вашою мовою.',
};

export function getLanguageMessage(browserLang: string): string | null {
    const baseLang = browserLang.split('-')[0].toLowerCase();

    // Don't show banner for English
    if (baseLang === 'en') return null;

    return LANGUAGE_MESSAGES[baseLang] || null;
}
