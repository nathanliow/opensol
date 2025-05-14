// Tutorial registry to export all available tutorial units
import introBlocks from './introduction/blocks';

export const tutorialUnits = {
  'intro-blocks': introBlocks,
};

export type TutorialUnitId = keyof typeof tutorialUnits; 