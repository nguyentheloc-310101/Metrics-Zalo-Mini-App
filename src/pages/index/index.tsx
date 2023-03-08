import React, { Suspense } from "react";
import { Box, Page } from "zmp-ui";
import { Inquiry } from "./inquiry";
import { Welcome } from "./welcome";
import { Banner } from "./banner";
import { Categories } from "./categories";
import { Recommend } from "./recommend";
import { ProductList } from "./product-list";

const HomePage: React.FunctionComponent = () => {
  return (
    <Page className="page">
      <Welcome />
      <Inquiry />
      <Banner />
      <Suspense>
        <Categories />
      </Suspense>
      <Box height={8}></Box>
      <Suspense>
        <Recommend />
      </Suspense>
      <Box height={8}></Box>
      <Suspense>
        <ProductList />
      </Suspense>
      <Box height={8}></Box>
    </Page>
  );
};

export default HomePage;
