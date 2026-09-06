import {
  TbAdjustmentsHorizontal,
  TbColumns,
  TbDoor,
  TbDoorExit,
  TbFlame,
  TbKey,
  TbLock,
  TbRulerMeasure2,
} from "react-icons/tb";

import { CATEGORY_ICONS } from "@/constants/categories";

const FALLBACK_ICON = TbDoor;

export const CATEGORY_ICON_COMPONENTS = Object.freeze({
  [CATEGORY_ICONS.DOOR_CLOSER]: TbAdjustmentsHorizontal || FALLBACK_ICON,

  [CATEGORY_ICONS.LEVER_HANDLE]: TbDoor || FALLBACK_ICON,

  [CATEGORY_ICONS.LOCK]: TbKey || FALLBACK_ICON,

  [CATEGORY_ICONS.HINGE]: TbColumns || FALLBACK_ICON,

  [CATEGORY_ICONS.EXIT]: TbDoorExit || FALLBACK_ICON,

  [CATEGORY_ICONS.SEAL]: TbRulerMeasure2 || FALLBACK_ICON,

  [CATEGORY_ICONS.FIRE]: TbFlame || FALLBACK_ICON,

  [CATEGORY_ICONS.ELECTRONIC_LOCK]: TbLock || FALLBACK_ICON,

  [CATEGORY_ICONS.DOOR]: TbDoor || FALLBACK_ICON,
});

export default function CategoryIcon({
  icon,
  className = "",
  strokeWidth = 1.7,
}) {
  const Icon = CATEGORY_ICON_COMPONENTS[icon] || FALLBACK_ICON;

  return (
    <Icon aria-hidden="true" strokeWidth={strokeWidth} className={className} />
  );
}
