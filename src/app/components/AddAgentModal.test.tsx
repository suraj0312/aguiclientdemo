import React from "react";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import AddAgentModal from "./AddAgentModal";

// Mock useCopilotContext
jest.mock("@copilotkit/react-core", () => ({
  useCopilotContext: () => ({
    threadId: "mock-thread-id",
  }),
}));

describe("AddAgentModal", () => {
  const mockOnAdd = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing and displays initial UI", () => {
    render(
      <AddAgentModal
        existingAgentNames={[]}
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText("Add A2A Agent")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeDisabled();
    expect(screen.getByPlaceholderText("e.g. My Agent")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("e.g. http://localhost:1234")
    ).toBeInTheDocument();
  });

  it("enables the Add button when form inputs are valid", () => {
    render(
      <AddAgentModal
        existingAgentNames={[]}
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("e.g. My Agent"), {
      target: { value: "Test Agent" },
    });

    fireEvent.change(screen.getByPlaceholderText("e.g. http://localhost:1234"), {
      target: { value: "http://localhost:8000" },
    });

    expect(screen.getByText("Add")).not.toBeDisabled();
  });

  it("displays an error on invalid agent URL", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock;

    render(
      <AddAgentModal
        existingAgentNames={[]}
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("e.g. http://localhost:1234"), {
      target: { value: "invalid-url" },
    });

    await act(async () => {
      fireEvent.blur(screen.getByPlaceholderText("e.g. http://localhost:1234"));
    });

    expect(
      await screen.findByText(
        "No agent details available for the given URL. Please check your URL."
      )
    ).toBeInTheDocument();
  });

  it("handles fetch error and displays error message", async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("Fetch error"))
    ) as jest.Mock;

    render(
      <AddAgentModal
        existingAgentNames={[]}
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("e.g. http://localhost:1234"), {
      target: { value: "http://localhost:8000" },
    });

    await act(async () => {
      fireEvent.blur(screen.getByPlaceholderText("e.g. http://localhost:1234"));
    });

    expect(
      await screen.findByText(
        "Unable to fetch agent details. Please verify the URL and try again."
      )
    ).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Add")).toBeDisabled();
  });

  it("fetches agent details successfully and displays them", async () => {
    const mockAgentCard = {
      description: "Mock Agent Description",
      capabilities: {
        extensions: [
          {
            params: {
              framework: "mock-framework",
            },
          },
        ],
      },
      skills: [
        {
          id: "1",
          name: "Mock Skill",
          description: "Mock Skill Description",
          tags: ["tag1", "tag2"],
          examples: ["example1", "example2"],
        },
      ],
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAgentCard),
      })
    ) as jest.Mock;

    render(
      <AddAgentModal
        existingAgentNames={[]}
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("e.g. http://localhost:1234"), {
      target: { value: "http://localhost:8000" },
    });

    await act(async () => {
      fireEvent.blur(screen.getByPlaceholderText("e.g. http://localhost:1234"));
    });

    expect(await screen.findByText("Mock Agent Description")).toBeInTheDocument();
    expect(await screen.findByText("mock-framework")).toBeInTheDocument();
    expect(await screen.findByText("Mock Skill")).toBeInTheDocument();
    expect(await screen.findByText("Mock Skill Description")).toBeInTheDocument();
  });

  it("calls onAdd with correct data when Add is clicked", async () => {
    const mockAgentCard = {
      description: "Mock Agent Description",
      capabilities: {
        extensions: [
          {
            params: {
              framework: "mock-framework",
            },
          },
        ],
      },
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAgentCard),
      })
    ) as jest.Mock;

    render(
      <AddAgentModal
        existingAgentNames={[]}
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("e.g. My Agent"), {
      target: { value: "Test Agent" },
    });

    fireEvent.change(screen.getByPlaceholderText("e.g. http://localhost:1234"), {
      target: { value: "http://localhost:8000" },
    });

    fireEvent.change(screen.getByPlaceholderText("System instructions for A2A Agent"), {
      target: { value: "Test Instructions" },
    });

    await act(async () => {
      fireEvent.blur(screen.getByPlaceholderText("e.g. http://localhost:1234"));
    });

    fireEvent.click(screen.getByText("Add"));

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith({
        name: "Test Agent",
        url: "http://localhost:8000",
        subAgents: [],
        instructions: "Test Instructions",
        framework: "mock-framework",
        description: "Mock Agent Description",
        type: "a2a_agent",
        session_id: "mock-thread-id",
        usage: 0,
      });
    });
  });

  it("displays an alert if agent name already exists", () => {
    window.alert = jest.fn();

    render(
      <AddAgentModal
        existingAgentNames={["Existing Agent"]}
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("e.g. My Agent"), {
      target: { value: "Existing Agent" },
    });

    fireEvent.change(screen.getByPlaceholderText("e.g. http://localhost:1234"), {
      target: { value: "http://localhost:8000" },
    });

    fireEvent.click(screen.getByText("Add"));

    expect(window.alert).toHaveBeenCalledWith(
      "Agent with given name already exist, use different name"
    );
  });

  it("calls onCancel when Cancel button is clicked", () => {
    render(
      <AddAgentModal
        existingAgentNames={[]}
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});