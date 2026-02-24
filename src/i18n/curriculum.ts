import type { Stage, Problem } from '../data/curriculum';
import type { Locale } from './strings';

export function getStageTitle(stage: Stage, locale: Locale) {
    return locale === 'ko' && stage.titleKo ? stage.titleKo : stage.title;
}

export function getStageSubtitle(stage: Stage, locale: Locale) {
    return locale === 'ko' && stage.subtitleKo ? stage.subtitleKo : stage.subtitle;
}

export function getStageDescription(stage: Stage, locale: Locale) {
    return locale === 'ko' && stage.descriptionKo ? stage.descriptionKo : stage.description;
}

export function getProblemTitle(problem: Problem, locale: Locale) {
    return locale === 'ko' && problem.titleKo ? problem.titleKo : problem.title;
}

export function getProblemDescription(problem: Problem, locale: Locale) {
    return locale === 'ko' && problem.descriptionKo ? problem.descriptionKo : problem.description;
}
