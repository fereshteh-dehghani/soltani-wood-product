import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FuseUtils from '@fuse/utils/FuseUtils';
import { Modal, Button, Text } from '@nextui-org/react';
import Select from 'react-select';
import '../../../../../../../styles/MyStyles.css';
import { Grid, MenuItem, TextField, InputLabel, Box } from '@mui/material';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persianFa from 'react-date-object/locales/persian_fa';
import { fetchBankAccountList } from 'app/main/apps/baseInformation/store/bankAccountSlice';
import {
  addToPaymentMethodsItems,
  findPaymentMethodData,
  updatePaymentMethodsItems,
} from '../../../store/paymentMethodsSlice';
import { handleModals } from '../../../store/handleModalsSlice';

const styleSaveBtn = {
  backgroundColor: '#153247',
  borderRadius: '5px',
  width: '48%',
  padding: '5px',
  paddingLeft: '50px',
  paddingRight: '50px',
};
const styleCancelBtn = {
  borderRadius: '5px',
  fontSize: '1.2rem',
  width: '48%',
  padding: '5px',
  paddingLeft: '50px',
  paddingRight: '50px',
};

const styleDiv = {
  'text-align': 'right',
};

const defaultValue = {
  amount: '',
  draftBankType: -1,
  bankDraftNumber: '',
  description: '',
  draftBankTypeName: '',
  cashId: 0,
};

const styleDatePicker = {
  'text-align': 'right',
  padding: '4px 12px',
  'background-color': 'white',
  height: '36px',
  width: '100%',
};

const draftBankTypeOptions = [
  { value: 0, label: 'حواله  اینترنتی' },
  { value: 1, label: 'حواله پایا' },
  { value: 2, label: 'حواله سانتا' },
  { value: 3, label: 'کارت به کارت' },
  { value: 4, label: 'سایر' },
];

export default function PaymentBankMethod({
  paymentMethodData,
  addCommas,
  removeNonNumeric,
  convertPriceToNumber,
}) {
  const { handlePaymentBank } = useSelector(({ buyAndSell }) => buyAndSell.handleModalsSlice);
  const dispatch = useDispatch();
  const [bankAccountList, setBankAccountList] = useState([]);
  const closeHandler = () => {
    dispatch(findPaymentMethodData({}));
    dispatch(handleModals({ type: 'paymentBank', isOpen: false }));
  };

  const schema = yup.object().shape({
    amount: yup.number('خطا در وارد کردن اطلاعات').required('لطفا مبلغ را وارد کنید!'),
    bankAccountId: yup.number('خطا در وارد کردن اطلاعات').required('لطفا فیلد بانک را وارد کنید'),
    datePer: yup.string('خطا در وارد کردن اطلاعات').required('لطفا تاریخ را وارد نمایید'),
    draftBankType: yup.number('خطا در وارد کردن اطلاعات').required('لطفا نوع پرداخت را مشخص کنید!'),
    bankDraftNumber: yup.string('خطا در وارد کردن اطلاعات').required('شماره رسید اجباری می باشد'),
  });

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const bankAccountId = watch('bankAccountId');
  const amount = watch('amount');
  const draftBankType = watch('draftBankType');
  const accountInfo = watch('accountInfo');
  const draftBankTypeName = watch('draftBankTypeName');

  const handleClick = (data) => {
    if (paymentMethodData?.id !== undefined) {
      dispatch(
        updatePaymentMethodsItems({
          ...paymentMethodData,
          ...data,
          description: `پرداخت مبلغ ${amount} از حساب ${accountInfo} به روش ${draftBankTypeName}`,
        })
      );
    } else {
      dispatch(
        addToPaymentMethodsItems({
          id: FuseUtils.generateGUID(),
          paymentMethod: 'paymentBank',
          paymentMethodPer: 'پرداخت فیش بانکی',
          ...data,
          description: `پرداخت مبلغ ${amount} از حساب ${accountInfo} به روش ${draftBankTypeName}`,
        })
      );
    }

    reset(defaultValue);
    dispatch(findPaymentMethodData({}));
  };

  useEffect(() => {
    if (paymentMethodData?.id !== undefined) reset(paymentMethodData);
    dispatch(fetchBankAccountList())
      .unwrap()
      .then((res) => {
        const tempArray = [];
        res?.forEach((item) => {
          tempArray.push({
            value: item.bankAccountId,
            label: `بانک ${item.bankAccountTitle} شعبه ${item.bankBranchTitle} (${item.owner})`,

          });
        });
        setBankAccountList([...tempArray]);
      });
  }, []);

  return (
    <div>
      <Modal
        closeButton
        aria-labelledby="modal-title"
        style={{ alignItems: 'center', paddingTop: '0px' }}
        width="60%"
        height="40%"
        open={handlePaymentBank}
        onClose={closeHandler}
      >
        <Modal.Header style={{ backgroundColor: '#1B2330', width: '100%', padding: '2%' }}>
          <Text id="modal-title" size={18} color="#fff">
            پرداخت بانکی
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Box>
            <Grid style={styleDiv} container justifyContent="center" marginX="10px" spacing={2} row>
              <Grid item xs={12} sm={5} className="my-5">
                <InputLabel>نوع پرداخت</InputLabel>
                <Select
                  isRtl
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable
                  name="userId"
                  style={{ direction: 'rtl' }}
                  options={draftBankTypeOptions}
                  value={draftBankTypeOptions?.find((item) => item.value === draftBankType)}
                  onChange={(event) => {
                    setValue('draftBankType', event.value);
                    setValue('draftBankTypeName', event.label);
                  }}
                />

                {errors?.draftBankType && (
                  <span className="text-danger">{errors?.draftBankType?.message}</span>
                )}
              </Grid>
              <Grid item xs={12} sm={5} className="my-5">
                <InputLabel>حساب بانکی</InputLabel>
                <Select
                  isRtl
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable
                  name="bankAccountId"
                  style={{ direction: 'rtl' }}
                  options={bankAccountList}
                  placeholder="..."
                  value={bankAccountList?.find((item) => item.value === bankAccountId)}
                  onChange={(event) => {
                    setValue('bankAccountId', event.value);
                    setValue('accountInfo', event.label);
                  }}
                />
                {errors?.bankAccountId && (
                  <span className="text-danger">{errors?.bankAccountId?.message}</span>
                )}
              </Grid>

              <Grid item xs={12} sm={3} className="my-2">
                <InputLabel>مبلغ</InputLabel>
                <TextField
                  required
                  fullWidth
                  name="amount"
                  id="amount"
                  size="small"
                  error={!!errors?.amount}
                  helperText={errors?.amount?.message}
                  value={addCommas(removeNonNumeric(amount))}
                  onChange={(event) => setValue('amount', convertPriceToNumber(event.target.value))}
                />
              </Grid>

              {errors?.date && <span className="text-danger">{errors?.date?.message}</span>}

              <Grid item xs={12} sm={4} className="my-2">
                <InputLabel>شماره رسید </InputLabel>
                <TextField
                  type="text"
                  variant="outlined"
                  fullWidth
                  name="bankDraftNumber"
                  id="bankDraftNumber"
                  size="small"
                  error={!!errors?.bankDraftNumber}
                  helperText={errors?.bankDraftNumber?.message}
                  {...register('bankDraftNumber')}
                />
              </Grid>

              <Grid item xs={12} sm={3} className="my-2">
                <InputLabel>تاریخ</InputLabel>
                <DatePicker
                  id="date"
                  style={styleDatePicker}
                  calendar={persian}
                  locale={persianFa}
                  placeholder="تاریخ YYYY/MM/DD"
                  containerStyle={{
                    width: '100%',
                  }}
                  calendarPosition="left-center"
                  onChange={(date) => {
                    const d = new Date(date).toLocaleDateString('fa-IR');
                    setValue('datePer', d);
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={10} className=" my-2">
                <InputLabel>توضیحات</InputLabel>
                <TextField
                  type="text"
                  multiline
                  rows={2}
                  variant="outlined"
                  fullWidth
                  name="description"
                  id="description"
                  {...register('description')}
                />
              </Grid>
            </Grid>
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="error"
            size={14}
            onPress={() => {
              dispatch(findPaymentMethodData({}));
              closeHandler();
            }}
            css={styleCancelBtn}
          >
            <Text color="#fff" size={16}>
              بستن
            </Text>
          </Button>
          <Button onPress={handleSubmit(handleClick)} size={14} css={styleSaveBtn}>
            <Text color="#fff" size={16}>
              ثبت
            </Text>
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
