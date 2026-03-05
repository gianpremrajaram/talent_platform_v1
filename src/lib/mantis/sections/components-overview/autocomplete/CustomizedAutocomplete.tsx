// material-ui
import { useAutocomplete, AutocompleteGetTagProps } from '@mui/base';
import { styled } from '@mui/material/styles';

// project imports
import MainCard from 'components/MainCard';
import data from 'data/movies';

// assets
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CheckOutlined from '@ant-design/icons/CheckOutlined';

const Root = styled('div')(({ theme }) => [
  { fontSize: 14, color: 'hsla(0, 0%, 0%, 0.85)' },
  theme.applyStyles('dark', { color: 'rgba(255,255,255,0.65)' })
]);

const InputWrapper = styled('div')(({ theme }) => [
  {
    width: '100%',
    border: '1px solid #d9d9d9',
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 8,
    display: 'flex',
    flexWrap: 'wrap',

    '&:hover': {
      borderColor: theme.vars.palette.primary.main
    },

    '&.focused': {
      borderColor: theme.vars.palette.primary.main,
      boxShadow: theme.vars.customShadows.primary
    },

    '& input': {
      backgroundColor: 'transparent',
      height: 30,
      boxSizing: 'border-box',
      padding: '4px 6px',
      width: 0,
      minWidth: 30,
      flexGrow: 1,
      border: 0,
      margin: 0,
      outline: 0
    }
  },
  theme.applyStyles('dark', {
    border: '1px solid #434343',
    backgroundColor: '#141414'
  })
]);

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  label: string;
}

function Tag(props: TagProps) {
  const { label, onDelete, ...other } = props;
  return (
    <div {...other}>
      <span>{label}</span>
      <CloseOutlined onClick={onDelete} />
    </div>
  );
}

const StyledTag = styled(Tag)<TagProps>(
  ({ theme }) => `
  display: flex;
  align-items: center;
  height: 24px;
  margin: 4px;
  line-height: 22px;
  background-color: ${theme.vars.palette.secondary.lighter};
  border: 1px solid ${theme.vars.palette.secondary.light};
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 0.625rem;
    cursor: pointer;
    padding: 4px;
  }
`
);

const Listbox = styled('ul')(
  ({ theme }) => `
  width: 300px;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: ${theme.vars.palette.background.paper};
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: ${theme.customShadows.z1};
  z-index: 1;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: ${theme.vars.palette.primary.lighter};
    font-weight: 600;

    & svg {
      color: ${theme.vars.palette.primary.main};
    }
  }

  & li[data-focus='true'] {
    background-color: ${theme.vars.palette.primary.lighter};
    cursor: pointer;

    & svg {
      color: currentColor;
    }
  }
`
);

// ==============================|| AUTOCOMPLETE - CUSTOMIZED ||============================== //

export default function CustomizedAutocomplete() {
  const { getRootProps, getInputProps, getTagProps, getListboxProps, getOptionProps, groupedOptions, value, focused, setAnchorEl } =
    useAutocomplete({
      id: 'customized-hook-demo',
      defaultValue: [data[1], data[3], data[8]],
      multiple: true,
      options: data,
      getOptionLabel: (option: { label: string; year: number }) => option.label
    });

  return (
    <MainCard title="Customized" sx={{ overflow: 'visible' }}>
      <Root>
        <div {...getRootProps()}>
          <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
            {value.map((option: FilmOptionType, index: number) => (
              <StyledTag label={option.label} {...getTagProps({ index })} key={index} />
            ))}
            <input {...getInputProps()} />
          </InputWrapper>
        </div>
        {groupedOptions.length > 0 ? (
          <Listbox {...getListboxProps()}>
            {(groupedOptions as typeof data).map((option, index) => {
              const { key, ...optionProps } = getOptionProps({ option, index });
              return (
                <li key={key} {...optionProps}>
                  <span>{option.label}</span>
                  <CheckOutlined style={{ marginTop: 2 }} />
                </li>
              );
            })}
          </Listbox>
        ) : null}
      </Root>
    </MainCard>
  );
}

interface FilmOptionType {
  label: string;
  year: number;
}
