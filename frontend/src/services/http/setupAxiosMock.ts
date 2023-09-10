import { vi } from "vitest";

export const mockAxios = vi.fn(async () => {
  return { data: "data" };
});

vi.mock("axios", () => ({
  ...mockAxios,
  default: mockAxios,
}));
