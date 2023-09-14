// need to mock axios in a different file in order to run the setup before the tests run
// and get acces to the mockAxios function, this import must be at the top
import { mockAxios } from "./setupAxiosMock";
import httpService from "./httpService";
import { describe, it, expect } from "vitest";

describe("HTTP Service Tests", () => {
  it("should perform GET request", async () => {
    const res = await httpService.get("test");
    expect(mockAxios).toHaveBeenCalled();
    expect(mockAxios).toHaveBeenCalledWith({
      url: "http://localhost:3030/api/test",
      method: "GET",
      data: null,
      params: null,
      withCredentials: true,
    });
    expect(res).toEqual("data");
  });

  it("should perform POST request", async () => {
    const res = await httpService.post("test", { data: "data" });
    expect(mockAxios).toHaveBeenCalled();
    expect(mockAxios).toHaveBeenCalledWith({
      url: "http://localhost:3030/api/test",
      method: "POST",
      data: { data: "data" },
      params: null,
      withCredentials: true,
    });
    expect(res).toEqual("data");
  });

  it("should perform PUT request", async () => {
    const res = await httpService.put("test", { data: "data" });
    expect(mockAxios).toHaveBeenCalled();
    expect(mockAxios).toHaveBeenCalledWith({
      url: "http://localhost:3030/api/test",
      method: "PUT",
      data: { data: "data" },
      params: null,
      withCredentials: true,
    });
    expect(res).toEqual("data");
  });

  it("should perform PATCH request", async () => {
    const res = await httpService.patch("test", { data: "data" });
    expect(mockAxios).toHaveBeenCalled();
    expect(mockAxios).toHaveBeenCalledWith({
      url: "http://localhost:3030/api/test",
      method: "PATCH",
      data: { data: "data" },
      params: null,
      withCredentials: true,
    });
    expect(res).toEqual("data");
  });

  it("should perform DELETE request", async () => {
    const res = await httpService.delete("test");
    expect(mockAxios).toHaveBeenCalled();
    expect(mockAxios).toHaveBeenCalledWith({
      url: "http://localhost:3030/api/test",
      method: "DELETE",
      data: null,
      params: null,
      withCredentials: true,
    });

    expect(res).toEqual("data");
  });
});
