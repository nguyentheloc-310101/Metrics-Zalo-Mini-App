import { supabase } from "services/supabase";

interface ExportParams {
    start_date: string;
    end_date: string;
}

const getClinicRevenue = async (params: ExportParams) => {
    const rpcParams = {
        start_date: params.start_date,
        end_date: params.end_date,
    };
    const { data: clinicRevenue, error: errorClinicRevenue } =
        await supabase.rpc("total_statistic_by_clinic", rpcParams);

    return { clinicRevenue, errorClinicRevenue };
};

export { getClinicRevenue };
export type { ExportParams };
