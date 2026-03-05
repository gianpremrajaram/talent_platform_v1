import type { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';

// Fix wrapper type for AntD icons used in MUI slots
export type IconSlotProps = AntdIconProps & { ownerState?: unknown };
