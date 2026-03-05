'use client';

import Link from 'next/link';

// material-ui
import { useColorScheme } from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import { ThemeMode } from 'config';
import ComponentHeader from 'components/cards/ComponentHeader';
import MainCard from 'components/MainCard';
import ComponentSkeleton from 'sections/components-overview/ComponentSkeleton';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

// assets
const AutocompleteLight = '/assets/images/all-component/autocomplete-light.png';
const AutocompleteDark = '/assets/images/all-component/autocomplete-dark.png';
const ButtonLight = '/assets/images/all-component/button-light.png';
const ButtonDark = '/assets/images/all-component/button-dark.png';
const CheckboxLight = '/assets/images/all-component/checkbox-light.png';
const CheckboxDark = '/assets/images/all-component/checkbox-dark.png';
const RadioLight = '/assets/images/all-component/radio-light.png';
const RadioDark = '/assets/images/all-component/radio-dark.png';
const RatingLight = '/assets/images/all-component/rating-light.png';
const RatingDark = '/assets/images/all-component/rating-dark.png';
const SwitchLight = '/assets/images/all-component/switch-light.png';
const SwitchDark = '/assets/images/all-component/switch-dark.png';
const SelectLight = '/assets/images/all-component/select-light.png';
const SelectDark = '/assets/images/all-component/select-dark.png';
const SliderLight = '/assets/images/all-component/slider-light.png';
const SliderDark = '/assets/images/all-component/slider-dark.png';
const TextFieldLight = '/assets/images/all-component/textfield-light.png';
const TextFieldDark = '/assets/images/all-component/textfield-dark.png';
const AvatarLight = '/assets/images/all-component/avatar-light.png';
const AvatarDark = '/assets/images/all-component/avatar-dark.png';
const BadgeLight = '/assets/images/all-component/badge-light.png';
const BadgeDark = '/assets/images/all-component/badge-dark.png';
const ChipLight = '/assets/images/all-component/chip-light.png';
const ChipDark = '/assets/images/all-component/chip-dark.png';
const ListLight = '/assets/images/all-component/list-light.png';
const ListDark = '/assets/images/all-component/list-dark.png';
const TooltipLight = '/assets/images/all-component/tooltip-light.png';
const TooltipDark = '/assets/images/all-component/tooltip-dark.png';
const TypographyLight = '/assets/images/all-component/typography-light.png';
const TypographyDark = '/assets/images/all-component/typography-dark.png';
const AlertLight = '/assets/images/all-component/alert-light.png';
const AlertDark = '/assets/images/all-component/alert-dark.png';
const SnackbarLight = '/assets/images/all-component/snackbar-light.png';
const SnackbarDark = '/assets/images/all-component/snackbar-dark.png';
const DialogLight = '/assets/images/all-component/dialog-light.png';
const DialogDark = '/assets/images/all-component/dialog-dark.png';
const ProgressLight = '/assets/images/all-component/progress-light.png';
const ProgressDark = '/assets/images/all-component/progress-dark.png';
const BreadcrumbsLight = '/assets/images/all-component/breadcrumb-light.png';
const BreadcrumbsDark = '/assets/images/all-component/breadcrumb-dark.png';
const PaginationLight = '/assets/images/all-component/pagination-light.png';
const PaginationDark = '/assets/images/all-component/pagination-dark.png';
const StepperLight = '/assets/images/all-component/stepper-light.png';
const StepperDark = '/assets/images/all-component/stepper-dark.png';
const TabsLight = '/assets/images/all-component/tabs-light.png';
const TabsDark = '/assets/images/all-component/tabs-dark.png';
const SpeedDialLight = '/assets/images/all-component/speed-dial-light.png';
const SpeedDialDark = '/assets/images/all-component/speed-dial-dark.png';
const AccordionLight = '/assets/images/all-component/accordion-light.png';
const AccordionDark = '/assets/images/all-component/accordion-dark.png';
const CardLight = '/assets/images/all-component/card-light.png';
const CardDark = '/assets/images/all-component/card-dark.png';
const ColorLight = '/assets/images/all-component/color-light.png';
const ColorDark = '/assets/images/all-component/color-dark.png';
const DateTimePickerLight = '/assets/images/all-component/date-time-light.png';
const DateTimePickerDark = '/assets/images/all-component/date-time-dark.png';
const ModalLight = '/assets/images/all-component/modal-light.png';
const ModalDark = '/assets/images/all-component/modal-dark.png';
const ShadowsLight = '/assets/images/all-component/shadows-light.png';
const ShadowsDark = '/assets/images/all-component/shadows-dark.png';
const TimeLineLight = '/assets/images/all-component/time-line-light.png';
const TimeLineDark = '/assets/images/all-component/time-line-dark.png';
const TreeViewLight = '/assets/images/all-component/tree-view-light.png';
const TreeViewDark = '/assets/images/all-component/tree-view-dark.png';

const categories = [
  {
    title: 'Inputs',
    items: [
      { href: 'autocomplete', label: 'Autocomplete', light: AutocompleteLight, dark: AutocompleteDark },
      { href: 'buttons', label: 'Button', light: ButtonLight, dark: ButtonDark },
      { href: 'checkbox', label: 'Checkbox', light: CheckboxLight, dark: CheckboxDark },
      { href: 'radio', label: 'Radio', light: RadioLight, dark: RadioDark },
      { href: 'rating', label: 'Rating', light: RatingLight, dark: RatingDark },
      { href: 'switch', label: 'Switch', light: SwitchLight, dark: SwitchDark },
      { href: 'select', label: 'Select', light: SelectLight, dark: SelectDark },
      { href: 'slider', label: 'Slider', light: SliderLight, dark: SliderDark },
      { href: 'textfield', label: 'Text Field', light: TextFieldLight, dark: TextFieldDark }
    ]
  },
  {
    title: 'Data Display',
    items: [
      { href: 'avatars', label: 'Avatar', light: AvatarLight, dark: AvatarDark },
      { href: 'badges', label: 'Badges', light: BadgeLight, dark: BadgeDark },
      { href: 'chips', label: 'Chip', light: ChipLight, dark: ChipDark },
      { href: 'lists', label: 'List', light: ListLight, dark: ListDark },
      { href: 'tooltip', label: 'Tooltip', light: TooltipLight, dark: TooltipDark },
      { href: 'typography', label: 'Typography', light: TypographyLight, dark: TypographyDark }
    ]
  },
  {
    title: 'Feedback',
    items: [
      { href: 'alert', label: 'Alert', light: AlertLight, dark: AlertDark },
      { href: 'dialogs', label: 'Dialog', light: DialogLight, dark: DialogDark },
      { href: 'progress', label: 'Progress', light: ProgressLight, dark: ProgressDark },
      { href: 'snackbar', label: 'Snackbar', light: SnackbarLight, dark: SnackbarDark }
    ]
  },
  {
    title: 'Navigation',
    items: [
      { href: 'breadcrumbs', label: 'Breadcrumbs', light: BreadcrumbsLight, dark: BreadcrumbsDark },
      { href: 'pagination', label: 'Pagination', light: PaginationLight, dark: PaginationDark },
      { href: 'speeddial', label: 'Speed Dial', light: SpeedDialLight, dark: SpeedDialDark },
      { href: 'stepper', label: 'Stepper', light: StepperLight, dark: StepperDark },
      { href: 'tabs', label: 'Tabs', light: TabsLight, dark: TabsDark }
    ]
  },
  {
    title: 'Surfaces',
    items: [
      { href: 'accordion', label: 'Accordion', light: AccordionLight, dark: AccordionDark },
      { href: 'cards', label: 'Card', light: CardLight, dark: CardDark }
    ]
  },
  {
    title: 'Utils',
    items: [
      { href: 'color', label: 'Color', light: ColorLight, dark: ColorDark },
      { href: 'date-time-picker', label: 'Date / Time Picker', light: DateTimePickerLight, dark: DateTimePickerDark },
      { href: 'modal', label: 'Modal', light: ModalLight, dark: ModalDark },
      { href: 'shadows', label: 'Shadows', light: ShadowsLight, dark: ShadowsDark },
      { href: 'timeline', label: 'Timeline', light: TimeLineLight, dark: TimeLineDark },
      { href: 'treeview', label: 'Tree View', light: TreeViewLight, dark: TreeViewDark }
    ]
  }
];

// ==============================|| COMPONENTS - ITEM CARD ||============================== //

function ItemCard({ href, label, image }: { href: string; label: string; image: string }) {
  return (
    <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
      <MainCard content={false}>
        <Link href={`/components-overview/${href}`} style={{ textDecoration: 'none' }}>
          <CardMedia component="img" image={image} alt={label} />
          <Typography variant="h5" color="secondary.dark" sx={{ textAlign: 'center', py: 1.75, bgcolor: 'grey.50' }}>
            {label}
          </Typography>
        </Link>
      </MainCard>
    </Grid>
  );
}

// ==============================|| COMPONENTS - ALL COMPONENT ||============================== //

export default function ComponentAllComponent() {
  const { colorScheme } = useColorScheme();

  return (
    <ComponentSkeleton>
      <ComponentHeader
        title="All Component"
        caption="With huge resource pack making deployment easy and expanding more effectively"
        directory="src/pages/components-overview/all-components"
        link="https://mui.com/material-ui/all-components/"
      />
      <ComponentWrapper>
        <Stack sx={{ gap: { xs: 3, sm: 5 } }}>
          {categories.map((category) => (
            <Stack key={category.title} sx={{ gap: { xs: 2.75, sm: 3.75 } }}>
              <Typography variant="h3">{category.title}</Typography>
              <Grid container spacing={{ xs: 1.25, sm: 3 }}>
                {category.items.map((item) => (
                  <ItemCard
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    image={colorScheme === ThemeMode.DARK ? item.dark || item.light : item.light}
                  />
                ))}
              </Grid>
            </Stack>
          ))}
        </Stack>
      </ComponentWrapper>
    </ComponentSkeleton>
  );
}
