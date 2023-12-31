import { Pie } from "@ant-design/charts";
import { message } from "antd";
import dayjs from "dayjs";
import { take } from "lodash";
import { DataCategories } from "pages/revenue";
import React, { useEffect, useState } from "react";
import { ExportParams } from "services/rpc/clinic-revenue";
import { getTopCategories } from "services/rpc/top-categories";
import { temp } from "utils/date-params-default";

interface DataCategoriesFetch {
    category_name: string;
    customer_paid: number;
    debit: number;
    revenue: number;
    total: number;
}

interface GraphCategoriesProps {
    setTopCategories: (e: DataCategories[]) => void;
}
const GraphCategories = (props: GraphCategoriesProps) => {
    const { setTopCategories } = props;
    const [data, setData] = useState<DataCategories[]>([]);

    useEffect(() => {
        const fetchCatagoriesData = async () => {
            try {
                const { dataCategories, errorCategories } =
                    await getTopCategories(temp);
                if (dataCategories) {
                    const top5categories: DataCategoriesFetch[] = take(
                        dataCategories,
                        5,
                    );
                    const totalRevenueCategory: number = dataCategories.reduce(
                        (prev: any, cur: any) => prev + cur.revenue,
                        0,
                    );
                    const formatTop5categories: DataCategories[] =
                        top5categories.map((item) => {
                            return {
                                type: item.category_name,
                                value:
                                    Math.floor(
                                        ((item.revenue * 100) /
                                            totalRevenueCategory) *
                                            100,
                                    ) / 100,
                                revenue: item.revenue,
                                customer_paid: item.customer_paid,
                                debit: item.debit,
                            };
                        });

                    setTopCategories(formatTop5categories);
                    setData(formatTop5categories);
                }
                if (errorCategories) {
                    message.error(errorCategories.message);
                    return;
                }
            } finally {
            }
        };
        fetchCatagoriesData();
    }, []);

    const config = {
        appendPadding: 10,
        data: [...data],
        angleField: "value",
        colorField: "type",
        radius: 0.9,
        label: {
            type: "inner",
            offset: "-30%",
            content: ({ percent }) => `${(percent * 100).toFixed(2)}%`,
            style: {
                fontSize: 14,
                textAlign: "center",
            },
        },
        interactions: [
            {
                type: "element-active",
            },
        ],
        color: [
            "#182CDC",
            "#3547E9",
            "#5A68ED",
            "#7E8AF1",
            "#A3ABF5",
            "#C8CDF9",
        ],
        legend: {
            title: {
                text: "Top 5 D.Mục",
                style: {
                    fontSize: 12,
                    fontWeight: 600,
                },
            },
        },
    };
    return (
        <>
            <Pie {...(config as any)} />
        </>
    );
};

export default GraphCategories;
