import { message } from "antd";
import useFetchClinicBookings from "common/stores/clinics/clinic-bookings";
import useFetchClinicOrders from "common/stores/clinics/clinic-orders";
import useDateFilter from "common/stores/date-filter";
import ButtonIcon from "components/button/ButtonIcon";
import LoadingSquareSpin from "components/loading";
import ModalDatePicker from "components/modals/ModalDatePicker";
import ClinicBookings from "components/order-bookings/clinic-bookings";
import BoxSum from "components/order-bookings/clinic-bookings/BoxSum";
import ClinicOrders from "components/order-bookings/clinic-orders";

import BoxStatistics from "components/overall-statistics/box-statistics";
import dayjs from "dayjs";

import React, { useEffect, useState } from "react";
import { getClinicBookings } from "services/rpc/clinic-bookings";
import { getClinicOrders } from "services/rpc/clinic-orders";
import { ExportParams } from "services/rpc/clinic-revenue";
import { dateRangeOptions } from "utils/date-data-filter";
import { temp } from "utils/date-params-default";
import { formatMoney } from "utils/money-format";
import { Header } from "zmp-ui";

interface DataCategories {
    type: string;
    value: number;
    revenue: number;
}
interface DataServices {
    value: number;
    type: string;
    revenue: number;
    service_image: string;
}
interface ClinicOrdersParams {
    orders: any;
    paid: number;
    unpaid: number;
    upsale: number;
}
interface ClinicBookingsParams {
    clinic_name: string;
    bookings: any;
    new: number;
    old: number;
}

const OrderBookings = () => {
    const { setClinicOrders } = useFetchClinicOrders();
    const { setClinicBookings } = useFetchClinicBookings();
    const { setDateFilter } = useDateFilter();

    const [totalOrders, setTotalOrders] = useState<number>(0);
    const [totalPaids, setTotalPaids] = useState<number>(0);
    const [totalUnpaids, setTotalUnpaids] = useState<number>(0);
    const [totalUpsales, setTotalUpsales] = useState<number>(0);
    const [totalBookings, setTotalBookings] = useState<number>(0);

    const [loading, setLoading] = useState<boolean>(false);

    const [date, setDate] = useState<ExportParams>(temp);
    const [indexSelect, setIndexSelect] = useState<any>(3);
    const [datePickerEnable, setDatePickerEnable] = useState<boolean>(false);
    const [openModalDateRangePicker, setOpenModalDateRangePicker] =
        useState<boolean>(false);
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

    useEffect(() => {
        const fetchClinicOrders = async () => {
            try {
                setLoading(true);
                const { dataClinicOrders, errorClinicOrders } =
                    await getClinicOrders(date);
                if (errorClinicOrders) {
                    message.error(errorClinicOrders.message);
                    return;
                }
                if (dataClinicOrders) {
                    const dataOverall: ClinicOrdersParams[] =
                        dataClinicOrders.map((item: any) => {
                            return {
                                orders:
                                    item.clinic_data.paid +
                                    item.clinic_data.unpaid,
                                paid: item.clinic_data.paid,
                                unpaid: item.clinic_data.unpaid,
                                upsale: item.clinic_data.upsale,
                            };
                        });
                    const totalOrder: number = dataOverall.reduce(
                        (prev: any, cur: any) => prev + cur.orders,
                        0,
                    );
                    const totalPaid: number = dataOverall.reduce(
                        (prev: any, cur: any) => prev + cur.paid,
                        0,
                    );
                    const totalUnpaid: number = dataOverall.reduce(
                        (prev: any, cur: any) => prev + cur.unpaid,
                        0,
                    );
                    const totalUpsale: number = dataOverall.reduce(
                        (prev: any, cur: any) => prev + cur.upsale,
                        0,
                    );
                    const statisticOrder = dataClinicOrders.sort(
                        (a, b) =>
                            b.clinic_data.paid +
                            b.clinic_data.unpaid -
                            (a.clinic_data.paid + a.clinic_data.unpaid),
                    );

                    setTotalOrders(totalOrder);
                    setTotalPaids(totalPaid);
                    setTotalUnpaids(totalUnpaid);

                    setTotalUpsales(totalUpsale);
                    setClinicOrders(statisticOrder);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchClinicOrders();
    }, [date]);

    useEffect(() => {
        const filterStatisticBookings = async () => {
            try {
                setLoading(true);
                const { dataClinicBookings, errorClinicBookings } =
                    await getClinicBookings(date);
                if (errorClinicBookings) {
                    message.error(errorClinicBookings.message);
                    return;
                }
                if (dataClinicBookings) {
                    const statisticOrder = dataClinicBookings.sort(
                        (a, b) =>
                            b.clinic_data.new +
                            b.clinic_data.old -
                            (a.clinic_data.new + a.clinic_data.old),
                    );

                    setClinicBookings(statisticOrder);
                }

                const dataBookings: ClinicBookingsParams[] =
                    dataClinicBookings.map((item: any) => {
                        return {
                            clinic_name: item.clinic_data.clinic_name,
                            bookings:
                                item.clinic_data.new + item.clinic_data.old,
                            new: item.clinic_data.new,
                            old: item.clinic_data.old,
                        };
                    });

                const sumBookings: number = dataBookings.reduce(
                    (prev: any, cur: any) => prev + cur.bookings,
                    0,
                );
                setTotalBookings(sumBookings);
            } finally {
                setLoading(false);
            }
        };
        filterStatisticBookings();
    }, [date]);

    return (
        <>
            <Header
                className="app-header no-border pl-4 flex-none pb-[6px] font-[500] leading-[26px] text-[20px] tracking-[0.15px]"
                showBackIcon={false}
                title="Order & bookings"
            />
            {loading ? (
                <LoadingSquareSpin />
            ) : (
                <div className="flex flex-col p-[16px] gap-[16px] overflow-y-scroll">
                    <div className="flex items-center justify-between">
                        <div className="w-full flex-wrap items-center justify-start flex gap-[5px]">
                            {dateRangeOptions.map((range, index) => {
                                return (
                                    <div
                                        onClick={() => {
                                            handleOnclickRange(
                                                index,
                                                range.value,
                                            );
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
                            {/* <ButtonIcon icon={"zi-location"} /> */}
                            <ButtonIcon
                                active={datePickerEnable}
                                icon={"zi-calendar"}
                                onClick={() => {
                                    setDatePickerEnable(true);
                                    setOpenModalDateRangePicker(true);
                                    setIndexSelect(null);
                                }}
                            />
                        </div>
                    </div>
                    {datePickerEnable && (
                        <ModalDatePicker
                            open={openModalDateRangePicker}
                            onClose={onHandleFilterDate}
                            setOpen={setDatePickerEnable}
                        />
                    )}
                    <div className="flex flex-col gap-[8px]">
                        <div className="flex gap-[8px]">
                            <BoxStatistics
                                title={"Tổng số order mới"}
                                number={formatMoney(totalOrders)}
                                current={"orders"}
                            />
                            <BoxStatistics
                                title={"Có thanh toán"}
                                number={formatMoney(totalPaids)}
                                current={"orders"}
                                colorNumber={"#5A68ED"}
                            />
                        </div>

                        <div className="flex gap-[8px]">
                            <BoxStatistics
                                title={"Không có thanh toán"}
                                colorNumber={"#D8315B"}
                                number={formatMoney(totalUnpaids)}
                                current={"orders"}
                            />
                            <BoxStatistics
                                title={"Upsale"}
                                number={0}
                                colorNumber={"#34B764"}
                                current={"orders"}
                            />
                        </div>
                    </div>
                    <ClinicOrders />
                    <BoxSum
                        title={"Tổng số bookings"}
                        number={formatMoney(totalBookings)}
                        currency={"bookings"}
                    />
                    <ClinicBookings />
                    {/* <TopSalers /> */}
                </div>
            )}
        </>
    );
};

export default OrderBookings;

export type { DataCategories, DataServices };
