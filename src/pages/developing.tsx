import DevelopingLoading from "components/developing-loading";
import React from "react";
import { Header } from "zmp-ui";

const Developing = () => {
    return (
        <div className="h-full">
            <Header
                className="app-header no-border pl-4 flex-none pb-[6px] font-[500] leading-[26px] text-[20px] tracking-[0.15px]"
                showBackIcon={true}
                title="Developing"
            />
            <DevelopingLoading />
        </div>
    );
};

export default Developing;
