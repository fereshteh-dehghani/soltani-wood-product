import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Modal, Button, Text } from "@nextui-org/react";
import Select from "react-select";
import FuseUtils from "@fuse/utils/FuseUtils";
import "../../../../../../../styles/MyStyles.css";
import { Grid, InputLabel, TextField } from "@mui/material";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import { fetchBankAccountList } from "app/main/apps/baseInformation/store/bankAccountSlice";
import {
  addToPaymentMethodsItems,
  findPaymentMethodData,
  updatePaymentMethodsItems,
} from "../../../store/paymentMethodsSlice";
import { handleModals } from "../../../store/handleModalsSlice";

const styleSaveBtn = {
  backgroundColor: "#153247",
  borderRadius: "5px",
  width: "48%",
  padding: "5px",
  paddingLeft: "50px",
  paddingRight: "50px",
};
const styleCancelBtn = {
  borderRadius: "5px",
  fontSize: "1.2rem",
  width: "48%",
  padding: "5px",
  paddingLeft: "50px",
  paddingRight: "50px",
};
const styleDatePicker = {
  "text-align": "right",
  padding: "4px 12px",
  "background-color": "white",
  height: "36px",
  width: "100%",
};
const styleDiv = {
  "text-align": "right",
};

const defaultValue = {
  amount: "",
  chequeSource: -1,
  chequeType: -1,
  paymentChequeNumber: "",
  secondNumber: "",
  accountNumber: "",
  branchCode: "",
  branchName: "",
  bankId: "",
  datePer: "",
  description: "",
};
const chequeTypeOptions = [
  { value: 0, label: "عادی" },
  { value: 1, label: "تضمینی" },
];
const chequeSourceOptions = [
  { value: 0, label: "چک جدید" },
  { value: 1, label: "چک های  دریافتی" },
];

const chequeList = [
  {
    chequeTitle: "cheque002",
    accountId: 3,
    chequeNumber: "12030",
    amount: 1200000,
    seconedChequeNumber: "12044",
    branchCode: "1000",
    branchName: "شیراز55",
    owner: "محمدی",
  },
  {
    chequeTitle: "cheque003",
    accountId: 3,
    chequeNumber: "12040",
    amount: 1500000,
    seconedChequeNumber: "12055",
    branchCode: "1001",
    branchName: "شیراز66",
    owner: "فروزنده",
  },
  {
    chequeTitle: "cheque004",
    accountId: 4,
    chequeNumber: "12050",
    amount: 1800000,
    seconedChequeNumber: "12066",
    branchCode: "1002",
    branchName: "شیراز77",
    owner: "رضایی",
  },
  {
    chequeTitle: "cheque005",
    accountId: 5,
    chequeNumber: "12060",
    amount: 2500000,
    seconedChequeNumber: "12077",
    branchCode: "1003",
    branchName: "شیراز88",
    owner: "امیری",
  },
];
export default function ReceiptChequeItem({
  paymentMethodData,
  addCommas,
  convertPriceToNumber,
  removeNonNumeric,
}) {
  const { handlePaymentCheque } = useSelector(
    ({ buyAndSell }) => buyAndSell.handleModalsSlice
  );
  const { partyBankAccountList } = useSelector(
    ({ buyAndSell }) => buyAndSell.salesInvoiceSlice
  );
  const [bankAccountList, setBankAccountList] = useState([]);
  const [partyChequeOptions, setPartyChequeOptions] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);

  const dispatch = useDispatch();
  const closeHandler = () => {
    dispatch(findPaymentMethodData({}));
    dispatch(handleModals({ type: "paymentCheque", isOpen: false }));
  };
  const schema = yup.object().shape({
    amount: yup.number().required("لطفا مبلغ را وارد کنید!"),
    chequeType: yup.number().required("لطفا نوع چک را انتخاب نمایید"),
  });
  const {
    register,
    reset,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const amount = watch("amount");
  const accountNumber = watch("accountNumber");
  const chequeSource = watch("chequeSource");
  const chequeType = watch("chequeType");

  const handleClick = (data) => {
    const chequeTypeName = chequeTypeOptions.find(
      (item) => item.value === chequeType
    ).label;
    const accountInfo = bankAccountList.find(
      (item) => item.value === accountNumber
    ).label;
    if (paymentMethodData?.id !== undefined) {
      dispatch(
        updatePaymentMethodsItems({
          ...paymentMethodData,
          ...data,
          description: ` پرداخت چک از حساب ${accountInfo} با میلغ ${amount} از نوع ${chequeTypeName}`,
        })
      );
    } else {
      dispatch(
        addToPaymentMethodsItems({
          id: FuseUtils.generateGUID(),
          paymentMethod: "paymentCheque",
          paymentMethodPer: "پرداخت چک",
          ...data,
          description: ` پرداخت چک از حساب  ${accountInfo} با مبلغ ${amount} از نوع ${chequeTypeName}`,
        })
      );
    }

    reset(defaultValue);
    dispatch(findPaymentMethodData({}));
  };

  useEffect(() => {
    if (paymentMethodData?.id !== undefined) reset(paymentMethodData);

    /* set options select account */
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
    /* set options select account */
    const tempArray = [];
    chequeList?.forEach((item) => {
      tempArray.push({
        value: item.accountId,
        label: ` چک ${item.chequeTitle} شعبه ${item.branchName} (${item.owner}) `,
      });
    });
    setPartyChequeOptions([...tempArray]);
  }, []);

  function handleChangeAccountSelect(event) {
    setValue("accountNumber", event.value);
    const selectedAccount = partyBankAccountList?.find(
      (item) => item.accountNumber === accountNumber
    );
    setValue("bankId", selectedAccount.bankId);
    setValue("branchName", selectedAccount.branchName);
    setValue("branchCode", selectedAccount.branchCode);
  }
  function handleChangeAccountSelect2(event) {
    setValue("accountNumber", event.value);
    const selectedAccount = chequeList?.find(
      (item) => item.accountId === event.value
    );
    setValue("bankId", selectedAccount.bankId);
    setValue("branchName", selectedAccount.branchName);
    setValue("branchCode", selectedAccount.branchCode);
    setValue("paymentChequeNumber", selectedAccount.chequeNumber);
    setValue("secondNumber", selectedAccount.seconedChequeNumber);
    setValue("chequeOwnerName", selectedAccount.owner);
    setValue("amount", selectedAccount.amount);
  }

  function resetFields() {
    setValue("bankId", -1);
    setValue("branchName", "");
    setValue("branchCode", "");
    setValue("paymentChequeNumber", "");
    setValue("secondNumber", "");
    setValue("accountNumber", "");
    setValue("chequeOwnerName", "");
    setValue("amount", "");
  }

  return (
    <Modal
      style={{ alignItems: "center", paddingTop: "0px" }}
      closeButton
      preventClose
      width="70%"
      height="60%"
      open={handlePaymentCheque}
      onClose={closeHandler}>
      <Modal.Header
        style={{ backgroundColor: "#1B2330", width: "100%", padding: "2%" }}>
        <Text id="modal-title" size={18} color="#fff">
          پرداخت چک
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Grid
          style={styleDiv}
          container
          spacing={2}
          justifyContent="center"
          marginX="10px"
          row>
          <Grid container item justifyContent="center" xs={12} spacing={2}>
            <Grid item xs={12} sm={3} className="mb-3">
              <InputLabel>نوع چک</InputLabel>
              <Select
                isRtl
                className="basic-single"
                classNamePrefix="select"
                isSearchable
                name="chequeType"
                style={{ direction: "rtl" }}
                options={chequeTypeOptions}
                value={chequeTypeOptions?.find(
                  (item) => item.value === chequeType
                )}
                onChange={(event) => setValue("chequeType", event.value)}
              />
              {errors?.chequeType && (
                <span className="text-danger">
                  {errors?.chequeType?.message}
                </span>
              )}
            </Grid>
            <Grid item xs={12} sm={3} className="mb-3">
              <InputLabel>منبع چک</InputLabel>
              <Select
                isRtl
                className="basic-single"
                classNamePrefix="select"
                isSearchable
                name="chequeType"
                style={{ direction: "rtl" }}
                options={chequeSourceOptions}
                value={chequeSourceOptions?.find(
                  (item) => item.value === chequeSource
                )}
                onChange={(event) => {
                  resetFields();
                  setValue("chequeSource", event.value);
                  if (event.value === 1) {
                    setIsDisabled(true);
                  } else {
                    setIsDisabled(false);
                  }
                }}
              />
              {errors?.chequeSource && (
                <span className="text-danger">
                  {errors?.chequeSource?.message}
                </span>
              )}
            </Grid>
            {chequeSource !== 1 && (
              <Grid item xs={12} sm={3} className="mb-3">
                <InputLabel>حساب مجموعه</InputLabel>
                <Select
                  isRtl
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable
                  name="userId"
                  style={{ direction: "rtl" }}
                  options={bankAccountList}
                  value={bankAccountList?.find(
                    (item) => item.value === accountNumber
                  )}
                  onChange={handleChangeAccountSelect}
                />
              </Grid>
            )}

            {chequeSource === 1 && (
              <Grid item xs={12} sm={3} className="mb-3">
                <InputLabel htmlFor="accountNumber">انتخاب چک</InputLabel>
                <Select
                  isRtl
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable
                  disabled={isDisabled}
                  name="accountNumber"
                  style={{ direction: "rtl" }}
                  options={partyChequeOptions}
                  value={partyChequeOptions?.find(
                    (item) => item.value === accountNumber
                  )}
                  onChange={handleChangeAccountSelect2}
                />
              </Grid>
            )}
          </Grid>
          {chequeSource === 1 && (
            <Grid container item justifyContent="center" xs={12} spacing={2}>
              <Grid item xs={12} sm={3} className="my-3">
                <InputLabel> کد شعبه</InputLabel>
                <TextField
                  required
                  fullWidth
                  id="branchCode"
                  type="text"
                  size="small"
                  variant="outlined"
                  disabled={isDisabled}
                  InputLabelProps={{ shrink: true }}
                  {...register("branchCode")}
                />
              </Grid>
              <Grid item xs={12} sm={3} className="my-3">
                <InputLabel htmlFor="branchName"> نام شعبه</InputLabel>
                <TextField
                  required
                  fullWidth
                  id="branchName"
                  type="text"
                  size="small"
                  variant="outlined"
                  disabled={isDisabled}
                  InputLabelProps={{ shrink: true }}
                  {...register("branchName")}
                />
              </Grid>
              <Grid item xs={12} sm={3} className="my-3">
                <InputLabel htmlFor="accountNumber">شماره حساب</InputLabel>
                <TextField
                  required
                  fullWidth
                  id="accountNumber"
                  type="text"
                  size="small"
                  variant="outlined"
                  disabled={isDisabled}
                  InputLabelProps={{ shrink: true }}
                  {...register("accountNumber")}
                />
              </Grid>
            </Grid>
          )}

          {/* <Grid item xs={12} sm={3} className="my-3">
              <InputLabel>مبلغ</InputLabel>
              <TextField
                required
                fullWidth
                size="small"
                error={!!errors?.amount}
                helperText={errors?.amount?.message}
                disabled={isDisabled}
                value={addCommas(removeNonNumeric(amount))}
                onChange={(event) =>
                  setValue("amount", convertPriceToNumber(event.target.value))
                }
              />
            </Grid>

            <Grid item xs={12} sm={3} className="my-3">
              <InputLabel>سررسید</InputLabel>

              <DatePicker
                id="date"
                style={styleDatePicker}
                calendar={persian}
                locale={persianFa}
                placeholder="سر رسید YYYY/MM/DD"
                calendarPosition="right-center"
                containerStyle={{
                  width: "100%",
                }}
                onChange={(date) => {
                  const d = new Date(date).toLocaleDateString("fa-IR");
                  setValue("dueDatePer", d);
                }}
              />
            </Grid> */}
        </Grid>

        <Grid container item justifyContent="center" xs={12} spacing={2}>
          <Grid item xs={12} sm={3} className="my-3">
            <InputLabel>نام صاحب چک</InputLabel>
            <TextField
              required
              fullWidth
              size="small"
              disabled={isDisabled}
              {...register("chequeOwnerName")}
            />
          </Grid>
          <Grid item xs={12} sm={3} className="my-3">
            <InputLabel>مبلغ</InputLabel>
            <TextField
              required
              fullWidth
              size="small"
              error={!!errors?.amount}
              helperText={errors?.amount?.message}
              value={addCommas(removeNonNumeric(amount))}
              disabled={isDisabled}
              onChange={(event) =>
                setValue("amount", convertPriceToNumber(event.target.value))
              }
            />
          </Grid>
          <Grid item xs={12} sm={3} className="my-3">
            <InputLabel>شماره چک دریافتی</InputLabel>
            <TextField
              required
              fullWidth
              size="small"
              disabled={isDisabled}
              error={!!errors?.paymentChequeNumber}
              helperText={errors?.paymentChequeNumber?.message}
              {...register("paymentChequeNumber")}
            />
          </Grid>
          <Grid item xs={12} sm={4} className="my-3">
            <InputLabel>2شماره چک دریافتی</InputLabel>
            <TextField
              required
              fullWidth
              size="small"
              disabled={isDisabled}
              {...register("secondNumber")}
            />
          </Grid>
          <Grid item xs={12} sm={5} className="my-3">
            <InputLabel>سررسید</InputLabel>
            <DatePicker
              id="datePer"
              style={styleDatePicker}
              calendar={persian}
              locale={persianFa}
              placeholder="سر رسید YYYY/MM/DD"
              calendarPosition="right-center"
              containerStyle={{
                width: "100%",
              }}
              onChange={(date) => {
                const d = new Date(date).toLocaleDateString("fa-IR");
                setValue("datePer", d);
              }}
            />
          </Grid>

          <Grid item xs={12} sm={9} className="mx-24">
            <InputLabel>توضیحات</InputLabel>
            <TextField
              type="text"
              multiline
              rows={2}
              variant="outlined"
              fullWidth
              {...register("description")}
            />
          </Grid>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Button
          color="error"
          size={14}
          onPress={() => {
            dispatch(findPaymentMethodData({}));
            closeHandler();
          }}
          css={styleCancelBtn}>
          <Text color="#fff" size={16}>
            بستن
          </Text>
        </Button>
        <Button
          onPress={handleSubmit(handleClick)}
          size={14}
          css={styleSaveBtn}>
          <Text color="#fff" size={16}>
            ثبت
          </Text>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
