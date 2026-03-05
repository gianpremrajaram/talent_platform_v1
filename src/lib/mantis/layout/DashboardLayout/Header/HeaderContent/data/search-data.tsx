import { ReactElement } from 'react';

// assets
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import BuildOutlined from '@ant-design/icons/BuildOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import CheckSquareOutlined from '@ant-design/icons/CheckSquareOutlined';
import ChromeOutlined from '@ant-design/icons/ChromeOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import CustomerServiceOutlined from '@ant-design/icons/CustomerServiceOutlined';
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import DashOutlined from '@ant-design/icons/DashOutlined';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import DotChartOutlined from '@ant-design/icons/DotChartOutlined';
import DragOutlined from '@ant-design/icons/DragOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import FileDoneOutlined from '@ant-design/icons/FileDoneOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import FormOutlined from '@ant-design/icons/FormOutlined';
import HighlightOutlined from '@ant-design/icons/HighlightOutlined';
import IdcardOutlined from '@ant-design/icons/IdcardOutlined';
import InsertRowAboveOutlined from '@ant-design/icons/InsertRowAboveOutlined';
import LineChartOutlined from '@ant-design/icons/LineChartOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';
import StepForwardOutlined from '@ant-design/icons/StepForwardOutlined';
import TableOutlined from '@ant-design/icons/TableOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

export interface SearchChild {
  id: string;
  title: string;
  icon: ReactElement;
  path: string;
  isExternal?: boolean;
}

export interface SearchGroup {
  id: string;
  title: string;
  childs: SearchChild[];
}

export type SearchDataType = SearchGroup[];

export const searchData: SearchDataType = [
  {
    id: 'dashboard',
    title: 'Dashboards',
    childs: [
      { id: 'dash-default', title: 'Default', icon: <DashboardOutlined />, path: '/dashboard/default' },
      { id: 'dash-analytics', title: 'Analytics', icon: <DotChartOutlined />, path: '/dashboard/analytics' },
      { id: 'dash-invoice', title: 'Invoice', icon: <FileTextOutlined />, path: '/dashboard/invoice' }
    ]
  },
  {
    id: 'widgets',
    title: 'Widgets',
    childs: [
      { id: 'wid-statistics', title: 'Statistics', icon: <IdcardOutlined />, path: '/widget/statistics' },
      { id: 'wid-data', title: 'Data', icon: <DatabaseOutlined />, path: '/widget/data' },
      { id: 'wid-chart', title: 'Chart', icon: <LineChartOutlined />, path: '/widget/chart' }
    ]
  },
  {
    id: 'applications',
    title: 'Applications',
    childs: [
      { id: 'app-chat', title: 'Chat', icon: <MessageOutlined />, path: '/apps/chat' },
      { id: 'app-calendar', title: 'Calendar', icon: <CalendarOutlined />, path: '/apps/calendar' },
      { id: 'app-kanban', title: 'Kanban', icon: <BuildOutlined />, path: '/apps/kanban/board' },
      { id: 'app-customer', title: 'Customer', icon: <CustomerServiceOutlined />, path: '/apps/customer/customer-list' },
      { id: 'app-invoice', title: 'Invoice', icon: <FileTextOutlined />, path: '/apps/invoice/dashboard' },
      { id: 'app-profile', title: 'Profile', icon: <UserOutlined />, path: '/apps/profiles/user/personal' },
      { id: 'app-e-commerce', title: 'E-commerce', icon: <ShoppingCartOutlined />, path: '/apps/e-commerce/products' }
    ]
  },
  {
    id: 'forms-tables',
    title: 'Forms & Tables',
    childs: [
      { id: 'ft-forms-validation', title: 'Forms Validation', icon: <FileDoneOutlined />, path: '/forms/validation' },
      { id: 'ft-forms-wizard', title: 'Forms Wizard', icon: <StepForwardOutlined />, path: '/forms/wizard' },
      { id: 'ft-forms-layout', title: 'Layout', icon: <FormOutlined />, path: '/forms/layout/basic' },
      { id: 'ft-react-tables', title: 'React Table', icon: <InsertRowAboveOutlined />, path: '/tables/react-table/basic' },
      { id: 'ft-mui-tables', title: 'MUI Table', icon: <TableOutlined />, path: '/tables/mui-table/basic' }
    ]
  },
  {
    id: 'plugins',
    title: 'Plugins',
    childs: [
      { id: 'plug-mask', title: 'Mask', icon: <DashOutlined />, path: '/forms/plugins/mask' },
      { id: 'plug-clipboard', title: 'Clipboard', icon: <CopyOutlined />, path: '/forms/plugins/clipboard' },
      { id: 'plug-re-captcha', title: 'ReCaptcha', icon: <CheckSquareOutlined />, path: '/forms/plugins/re-captcha' },
      { id: 'plug-editor', title: 'Editor', icon: <HighlightOutlined />, path: '/forms/plugins/editor' },
      { id: 'plug-dropzone', title: 'Dropzone', icon: <DragOutlined />, path: '/forms/plugins/dropzone' }
    ]
  },
  {
    id: 'charts-map',
    title: 'Charts & Map',
    childs: [
      { id: 'cm-apexchart', title: 'Apexchart', icon: <PieChartOutlined />, path: '/charts/apexchart' },
      { id: 'cm-org-chart', title: 'Organization Chart', icon: <ApartmentOutlined />, path: '/charts/org-chart' },
      { id: 'cm-map', title: 'Map', icon: <EnvironmentOutlined />, path: '/map' }
    ]
  },
  {
    id: 'pages',
    title: 'Pages',
    childs: [
      { id: 'page-sample', title: 'Sample Page', icon: <ChromeOutlined />, path: '/sample-page' },
      { id: 'page-change-log', title: 'Change Log', icon: <QuestionCircleOutlined />, path: '/change-log', isExternal: true },
      { id: 'page-contact-us', title: 'Contact US', icon: <PhoneOutlined />, path: '/contact-us', isExternal: true },
      { id: 'page-faqs', title: 'Faqs', icon: <QuestionCircleOutlined />, path: '/faqs', isExternal: true },
      { id: 'page-pricing', title: 'Pricing', icon: <DollarOutlined />, path: '/pricing' }
    ]
  }
];
