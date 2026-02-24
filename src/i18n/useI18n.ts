import { useGameStore } from '../store/useGameStore';
import { STRINGS } from './strings';

export function useI18n() {
    const locale = useGameStore((state) => state.locale);
    const t = (key: string) => STRINGS[locale][key] ?? STRINGS.en[key] ?? key;
    return { locale, t };
}
