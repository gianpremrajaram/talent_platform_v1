// material-ui
import { Palette, SupportedColorScheme } from '@mui/material/styles';

// third-party
import { Page, View, Document, StyleSheet } from '@react-pdf/renderer';

// project imports
import Header from './Header';
import Content from './Content';

// types
import { InvoiceList } from 'types/invoice';

export const getStyles = (currentPalette: Palette) => {
  return StyleSheet.create({
    page: {
      padding: 30,
      backgroundColor: currentPalette.background.paper
    },
    container: {
      flex: 1,
      flexDirection: 'row',
      '@media max-width: 400': {
        flexDirection: 'column'
      }
    }
  });
};

// ==============================|| INVOICE EXPORT ||============================== //

interface Props {
  list: InvoiceList | any;
  currentPalette: Palette;
  themeMode: SupportedColorScheme;
}

export default function ExportPDFView({ list, currentPalette, themeMode }: Props) {
  const styles = getStyles(currentPalette);
  const title = list?.invoiceId || list?.invoice_id;
  const customer_name = list?.customer_name || list?.from?.name || list?.customerInfo?.name;

  return (
    <Document title={`${title} ${customer_name}`}>
      <Page size="A4" style={styles.page}>
        <Header list={list} themeMode={themeMode} currentPalette={currentPalette} />
        <View style={styles.container}>
          <Content list={list} currentPalette={currentPalette} />
        </View>
      </Page>
    </Document>
  );
}
