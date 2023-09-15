import { it, describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { AsyncList } from "./AsyncList";

describe("AsyncList", () => {
  it("renders loading state", () => {
    render(
      <AsyncList
        isLoading={true}
        isSuccess={false}
        isError={false}
        isEmpty={false}
        items={[]}
        render={() => <div />}
        entityName="entity"
      />
    );

    expect(screen.queryByTestId("spinner-loader")).toBeInTheDocument();
  });

  it("renders success state with items", () => {
    const items = [{ id: 1 }, { id: 2 }];
    render(
      <AsyncList
        isLoading={false}
        isSuccess={true}
        isError={false}
        isEmpty={false}
        items={items}
        render={item => <div key={item.id}>{item.id}</div>}
        entityName="entity"
      />
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders success state without items", () => {
    render(
      <AsyncList
        isLoading={false}
        isSuccess={true}
        isError={false}
        isEmpty={true}
        items={[]}
        render={() => <div />}
        entityName="entity"
      />
    );
    expect(screen.getByText("No entity could be found...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(
      <AsyncList
        isLoading={false}
        isSuccess={false}
        isError={true}
        isEmpty={false}
        items={[]}
        render={() => <div />}
        entityName="entity"
      />
    );
    expect(screen.getByText("Couldn't get entity. Please try again later.")).toBeInTheDocument();
  });
});
