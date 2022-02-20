import { Layout } from "antd";
import React from "react";
import Documents from "./documents/Documents";

const { Content, Footer } = Layout;

export default () => (
  <Layout className="layout">
    <Content style={{ padding: "0 50px" }}>
      <div className="site-layout-content" style={{ margin: "100px auto" }}>
        <h1>User Dashboard</h1>
        <Documents />
      </div>
    </Content>
    <Footer style={{ textAlign: "center" }}>Sajed - Ekanek ©2022.</Footer>
  </Layout>
);