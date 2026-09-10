"use client";

import { useCallback } from "react";

import { ABOUT_LIMITS, ABOUT_SECTION_TYPES } from "@/constants/about";
import {
  createAboutAction,
  createAboutItem,
  createAboutSection,
} from "@/modules/about/about.factory";

function findIndexById(items, id) {
  return items.findIndex((item) => item.id === id);
}

function moveItem(items, itemId, direction) {
  const currentIndex = findIndexById(items, itemId);

  const nextIndex = currentIndex + direction;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];

  [nextItems[currentIndex], nextItems[nextIndex]] = [
    nextItems[nextIndex],
    nextItems[currentIndex],
  ];

  return nextItems;
}

function applyUpdate(currentValue, update) {
  if (typeof update === "function") {
    return update(currentValue);
  }

  return {
    ...currentValue,
    ...update,
  };
}

function duplicateAction(action) {
  const createdAction = createAboutAction();

  return {
    ...structuredClone(action),

    id: createdAction.id,
  };
}

function duplicateItem(item) {
  const createdItem = createAboutItem();

  return {
    ...structuredClone(item),

    id: createdItem.id,
  };
}

function duplicateSection(section) {
  const createdSection = createAboutSection({
    type: section.type,
  });

  return {
    ...structuredClone(section),

    id: createdSection.id,

    internalLabel: {
      en: section.internalLabel?.en ? `${section.internalLabel.en} Copy` : "",

      th: section.internalLabel?.th ? `${section.internalLabel.th} สำเนา` : "",
    },

    actions: Array.isArray(section.actions)
      ? section.actions.map(duplicateAction)
      : [],

    items: Array.isArray(section.items) ? section.items.map(duplicateItem) : [],
  };
}

export function useAboutBuilderController(builder) {
  const { updateDraft } = builder;

  const updateSeo = useCallback(
    (update) => {
      updateDraft((draft) => ({
        ...draft,

        seo: applyUpdate(draft.seo, update),
      }));
    },
    [updateDraft],
  );

  const setSeoImage = useCallback(
    (asset) => {
      updateSeo((seo) => ({
        ...seo,

        imageMediaId: asset?.id || null,

        image: asset || null,
      }));
    },
    [updateSeo],
  );

  const addSection = useCallback(
    (type = ABOUT_SECTION_TYPES.RICH_CONTENT) => {
      updateDraft((draft) => {
        if (draft.sections.length >= ABOUT_LIMITS.SECTION_MAX_COUNT) {
          return draft;
        }

        return {
          ...draft,

          sections: [
            ...draft.sections,

            createAboutSection({
              type,

              sortOrder: (draft.sections.length + 1) * 10,
            }),
          ],
        };
      });
    },
    [updateDraft],
  );

  const updateSection = useCallback(
    (sectionId, update) => {
      updateDraft((draft) => ({
        ...draft,

        sections: draft.sections.map((section) =>
          section.id === sectionId ? applyUpdate(section, update) : section,
        ),
      }));
    },
    [updateDraft],
  );

  const removeSection = useCallback(
    (sectionId) => {
      updateDraft((draft) => ({
        ...draft,

        sections: draft.sections.filter((section) => section.id !== sectionId),
      }));
    },
    [updateDraft],
  );

  const copySection = useCallback(
    (sectionId) => {
      updateDraft((draft) => {
        if (draft.sections.length >= ABOUT_LIMITS.SECTION_MAX_COUNT) {
          return draft;
        }

        const sectionIndex = findIndexById(draft.sections, sectionId);

        if (sectionIndex < 0) {
          return draft;
        }

        const sections = [...draft.sections];

        sections.splice(
          sectionIndex + 1,
          0,
          duplicateSection(sections[sectionIndex]),
        );

        return {
          ...draft,

          sections,
        };
      });
    },
    [updateDraft],
  );

  const moveSection = useCallback(
    (sectionId, direction) => {
      updateDraft((draft) => ({
        ...draft,

        sections: moveItem(draft.sections, sectionId, direction),
      }));
    },
    [updateDraft],
  );

  const changeSectionType = useCallback(
    (sectionId, type) => {
      updateSection(sectionId, (section) => {
        if (section.type === type) {
          return section;
        }

        const defaults = createAboutSection({
          type,

          sortOrder: section.sortOrder,
        });

        return {
          ...section,

          type,

          layout: defaults.layout,
        };
      });
    },
    [updateSection],
  );

  const toggleSection = useCallback(
    (sectionId) => {
      updateSection(sectionId, (section) => ({
        ...section,

        enabled: section.enabled === false,
      }));
    },
    [updateSection],
  );

  const setSectionImage = useCallback(
    (sectionId, asset) => {
      updateSection(sectionId, (section) => ({
        ...section,

        imageMediaId: asset?.id || null,

        image: asset || null,
      }));
    },
    [updateSection],
  );

  const addAction = useCallback(
    (sectionId) => {
      updateSection(sectionId, (section) => {
        const actions = Array.isArray(section.actions) ? section.actions : [];

        if (actions.length >= ABOUT_LIMITS.ACTIONS_MAX_COUNT) {
          return section;
        }

        return {
          ...section,

          actions: [...actions, createAboutAction()],
        };
      });
    },
    [updateSection],
  );

  const updateAction = useCallback(
    (sectionId, actionId, update) => {
      updateSection(sectionId, (section) => ({
        ...section,

        actions: section.actions.map((action) =>
          action.id === actionId ? applyUpdate(action, update) : action,
        ),
      }));
    },
    [updateSection],
  );

  const removeAction = useCallback(
    (sectionId, actionId) => {
      updateSection(sectionId, (section) => ({
        ...section,

        actions: section.actions.filter((action) => action.id !== actionId),
      }));
    },
    [updateSection],
  );

  const moveAction = useCallback(
    (sectionId, actionId, direction) => {
      updateSection(sectionId, (section) => ({
        ...section,

        actions: moveItem(section.actions, actionId, direction),
      }));
    },
    [updateSection],
  );

  const addSectionItem = useCallback(
    (sectionId) => {
      updateSection(sectionId, (section) => {
        const items = Array.isArray(section.items) ? section.items : [];

        if (items.length >= ABOUT_LIMITS.ITEMS_MAX_COUNT) {
          return section;
        }

        return {
          ...section,

          items: [
            ...items,

            createAboutItem({
              sortOrder: (items.length + 1) * 10,
            }),
          ],
        };
      });
    },
    [updateSection],
  );

  const updateSectionItem = useCallback(
    (sectionId, itemId, update) => {
      updateSection(sectionId, (section) => ({
        ...section,

        items: section.items.map((item) =>
          item.id === itemId ? applyUpdate(item, update) : item,
        ),
      }));
    },
    [updateSection],
  );

  const removeSectionItem = useCallback(
    (sectionId, itemId) => {
      updateSection(sectionId, (section) => ({
        ...section,

        items: section.items.filter((item) => item.id !== itemId),
      }));
    },
    [updateSection],
  );

  const moveSectionItem = useCallback(
    (sectionId, itemId, direction) => {
      updateSection(sectionId, (section) => ({
        ...section,

        items: moveItem(section.items, itemId, direction),
      }));
    },
    [updateSection],
  );

  const setSectionItemImage = useCallback(
    (sectionId, itemId, asset) => {
      updateSectionItem(sectionId, itemId, (item) => ({
        ...item,

        imageMediaId: asset?.id || null,

        image: asset || null,
      }));
    },
    [updateSectionItem],
  );

  return {
    updateSeo,
    setSeoImage,

    addSection,
    updateSection,
    removeSection,
    copySection,
    moveSection,
    changeSectionType,
    toggleSection,
    setSectionImage,

    addAction,
    updateAction,
    removeAction,
    moveAction,

    addSectionItem,
    updateSectionItem,
    removeSectionItem,
    moveSectionItem,
    setSectionItemImage,
  };
}
