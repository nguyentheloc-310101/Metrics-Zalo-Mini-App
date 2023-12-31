import { message } from "antd";
import useFetchClinic from "common/stores/clinics/clinic-revenue";
import useFetchCustomers from "common/stores/customers/customers";
import useDateFilter from "common/stores/date-filter";

import ButtonIcon from "components/button/ButtonIcon";
import LoadingSquareSpin from "components/loading";
import ModalDatePicker from "components/modals/ModalDatePicker";
import ModalMultipleSelects from "components/modals/ModalMultipleSelects";
import ClinicRevenue from "components/overall-statistics/ClinicRevenue";
import ServiceRevenue from "components/overall-statistics/ServiceRevenue";
import BoxStatistics from "components/overall-statistics/box-statistics";
import TopCustomers from "components/overall-statistics/table/TopCustomers";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ExportParams, getClinicRevenue } from "services/rpc/clinic-revenue";
import { getTopCustomer } from "services/rpc/top-customer";
import { dateRangeOptions } from "utils/date-data-filter";
import { temp } from "utils/date-params-default";
import { formatMoney } from "utils/money-format";

import { Header } from "zmp-ui";

interface DataCategories {
  type: string;
  value: any;
  customer_paid: number;
  debit: number;
  revenue: number;
}
interface DataServices {
  value: any;
  type: string;
  revenue: any;
  service_image: string;
  customer_paid: number;
  debit: number;
}
const RevenuePage = () => {
  const { clinics, setClinics } = useFetchClinic();
  const { customers, setCustomers } = useFetchCustomers();
  const { dateFilter, setDateFilter } = useDateFilter();
  const [date, setDate] = useState<ExportParams>(temp);

  const [totalRevenue, setTotalRevenue] = useState<string>("");
  const [totalCustomerPaid, setTotalCustomerPaid] = useState<string>("");
  const [totalDebit, setTotalDebit] = useState<string>("");
  const [indexSelect, setIndexSelect] = useState<any>(3);

  const [loading, setLoading] = useState<boolean>(false);

  const [datePickerEnable, setDatePickerEnable] = useState<boolean>(false);
  const [openModalDateRangePicker, setOpenModalDateRangePicker] =
    useState<boolean>(false);
  const [filterClinicEnable, setFilterClinicEnable] = useState<boolean>(false);
  const [openModalFilterClinic, setOpenModalFilterClinic] =
    useState<boolean>(false);

  const [clinicTakeByFilter, setClinicsTakeByFilter] = useState<string[]>([]);
  const handleOnclickRange = (index: number, value: string) => {
    if (index == indexSelect) {
      setIndexSelect(null);
      setDate(temp);
      setDateFilter(temp);
    } else if (index !== indexSelect) {
      setIndexSelect(index);
      if (value == "thisWeek") {
        console.log("week");

        thisWeekStatistics();
      } else if (value == "thisMonth") {
        console.log("month");
        thisMonthStatistic();
      } else if (value == "today") {
        console.log("today");
        todayStatistics();
      } else if (value == "yesterday") {
        console.log("yesterday");
        yesterdayFilter();
      }
    }
  };
  const thisWeekStatistics = () => {
    const now = dayjs().format("YYYY-MM-DD");
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - daysToSubtract);
    const dateNew: ExportParams = {
      start_date: dayjs(firstDayOfWeek).format("YYYY-MM-DD"),
      end_date: now,
    };
    setDate(dateNew);
    setDateFilter(dateNew);
  };
  const todayStatistics = () => {
    const now = dayjs().format("YYYY-MM-DD");
    const dateNew: ExportParams = {
      start_date: now,
      end_date: now,
    };
    setDate(dateNew);
    setDateFilter(dateNew);
  };
  const yesterdayFilter = () => {
    const currentDate = new Date();
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    const formatDate = dayjs(previousDate).format("YYYY-MM-DD");
    const dateNew: ExportParams = {
      start_date: formatDate,
      end_date: formatDate,
    };
    setDate(dateNew);
    setDateFilter(dateNew);
  };

  const thisMonthStatistic = () => {
    const now = dayjs().format("YYYY-MM-DD");
    const currentDate = new Date();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const dateNew: ExportParams = {
      start_date: dayjs(firstDayOfMonth).format("YYYY-MM-DD"),
      end_date: now,
    };
    setDate(dateNew);
    setDateFilter(dateNew);
  };
  const onHandleFilterDate = (date_start: string, date_end: string) => {
    const dateNew: ExportParams = {
      start_date: date_start,
      end_date: date_end,
    };
    setDate(dateNew);
    setDateFilter(dateNew);
    setOpenModalDateRangePicker(false);
  };

  console.log("clinicTakeByFilter", clinicTakeByFilter);
  useEffect(() => {
    const fetchClinicRevenue = async () => {
      try {
        setLoading(true);
        const { clinicRevenue, errorClinicRevenue } =
          await getClinicRevenue(date);
        const { dataCustomer, errorCustomer } = await getTopCustomer(date);

        if (errorClinicRevenue) {
          message.error(errorClinicRevenue.message);
          return;
        }
        if (clinicRevenue) {
          if (clinicTakeByFilter.length == 0) {
            setClinics(clinicRevenue);
            const revenue = clinicRevenue.reduce(
              (prev: any, cur: any) => prev + cur.revenue,
              0,
            );
            const customerPaid = clinicRevenue.reduce(
              (prev: any, cur: any) => prev + cur.customer_paid,
              0,
            );
            const debit = clinicRevenue.reduce(
              (prev: any, cur: any) => prev + cur.debit,
              0,
            );
            setTotalRevenue(formatMoney(revenue));
            setTotalCustomerPaid(formatMoney(customerPaid));
            setTotalDebit(formatMoney(debit));

            if (errorCustomer) {
              message.error(errorCustomer.message);
              return;
            }
            if (dataCustomer) {
              setCustomers(dataCustomer);
            }
          } else {
            const result = clinicTakeByFilter.map((clinic) => {
              clinicRevenue.filter((item) => item.name == clinic);
            });
            console.log("clinic filter ne", result);
            setClinics(clinicRevenue);
            const revenue = clinicRevenue.reduce(
              (prev: any, cur: any) => prev + cur.revenue,
              0,
            );
            const customerPaid = clinicRevenue.reduce(
              (prev: any, cur: any) => prev + cur.customer_paid,
              0,
            );
            const debit = clinicRevenue.reduce(
              (prev: any, cur: any) => prev + cur.debit,
              0,
            );
            setTotalRevenue(formatMoney(revenue));
            setTotalCustomerPaid(formatMoney(customerPaid));
            setTotalDebit(formatMoney(debit));

            if (errorCustomer) {
              message.error(errorCustomer.message);
              return;
            }
            if (dataCustomer) {
              setCustomers(dataCustomer);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClinicRevenue();
  }, [dateFilter]);
  return (
    <>
      <Header
        className="app-header no-border pl-4 flex-none pb-[6px] font-[500] leading-[26px] text-[20px] tracking-[0.15px]"
        showBackIcon={false}
        title="Doanh thu"
      />
      {loading ? (
        <LoadingSquareSpin />
      ) : (
        <div className="flex flex-col p-[16px] gap-[16px] overflow-y-scroll">
          <div className="flex items-center justify-between">
            <div className="w-full flex flex-wrap items-center justify-start gap-[5px]">
              {dateRangeOptions.map((range, index) => {
                return (
                  <div
                    onClick={() => {
                      handleOnclickRange(index, range.value);
                    }}
                    key={index}
                    className={`${
                      indexSelect == index
                        ? "bg-[#36383A] text-white"
                        : "bg-[white] text-[#36383A]"
                    } rounded-[8px] text-[10px]  font-[400] leading-[16px] flex items-center justify-center w- h-[24px] px-[12px] py-[4px]`}
                  >
                    {range.title}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-[8px]">
              {/* <ButtonIcon
                                icon={"zi-location"}
                                onClick={() => {
                                    setFilterClinicEnable(true);
                                    setOpenModalFilterClinic(true);
                                    setIndexSelect(null);
                                }}
                                active={filterClinicEnable}
                            /> */}
              <ButtonIcon
                onClick={() => {
                  setDatePickerEnable(true);
                  setOpenModalDateRangePicker(true);
                  setIndexSelect(null);
                }}
                active={datePickerEnable}
                icon={"zi-calendar"}
              />
            </div>
          </div>
          {datePickerEnable == true && (
            <ModalDatePicker
              open={openModalDateRangePicker}
              onClose={onHandleFilterDate}
              setOpen={setDatePickerEnable}
            />
          )}
          {filterClinicEnable == true && (
            <ModalMultipleSelects
              setDataFilter={setClinicsTakeByFilter}
              open={openModalFilterClinic}
              onClose={undefined}
              setOpen={setFilterClinicEnable}
            />
          )}
          <div className="flex flex-col gap-[8px]">
            <BoxStatistics
              title={"Doanh Thu"}
              number={totalRevenue}
              current={"đ"}
            />
            <div className="flex gap-[8px]">
              <BoxStatistics
                title={"Thực thu"}
                colorNumber={"#5A68ED"}
                number={totalCustomerPaid}
                current={"đ"}
              />
              <BoxStatistics
                title={"Công nợ"}
                number={totalDebit}
                colorNumber={"#D8315B"}
                current={"đ"}
              />
            </div>
          </div>
          {clinics && <ClinicRevenue data={[...clinics]} />}
          <ServiceRevenue />
          <TopCustomers customers={[...customers]} />

          {/* <TopSalers /> */}
        </div>
      )}
    </>
  );
};

export default RevenuePage;

export type { DataCategories, DataServices };
