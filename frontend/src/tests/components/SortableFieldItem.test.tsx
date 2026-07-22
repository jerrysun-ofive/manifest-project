import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { SortableFieldItem } from "../../features/form-builder/components/SortableFieldItem";

const sortableMocks = vi.hoisted(() => ({
  useSortable: vi.fn(),
  setNodeRef: vi.fn(),
  setActivatorNodeRef: vi.fn(),
  onPointerDown: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: sortableMocks.useSortable,
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: vi.fn(
        () =>
          "translate3d(10px, 20px, 0)",
      ),
    },
  },
}));

describe("SortableFieldItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    sortableMocks.useSortable.mockReturnValue({
      attributes: {
        tabIndex: 0,
      },
      listeners: {
        onPointerDown:
          sortableMocks.onPointerDown,
      },
      setNodeRef:
        sortableMocks.setNodeRef,
      setActivatorNodeRef:
        sortableMocks.setActivatorNodeRef,
      transform: {
        x: 10,
        y: 20,
        scaleX: 1,
        scaleY: 1,
      },
      transition: "transform 200ms ease",
      isDragging: true,
    });
  });

  it("registers the field with useSortable", () => {
    render(
      <SortableFieldItem
        fieldId="field-1"
        fieldLabel="First name"
        dropIndicator={null}
      >
        <article>Field content</article>
      </SortableFieldItem>,
    );

    expect(
      sortableMocks.useSortable,
    ).toHaveBeenCalledWith({
      id: "field-1",
    });
  });

  it("renders an accessible drag handle", () => {
    render(
      <SortableFieldItem
        fieldId="field-1"
        fieldLabel="First name"
        dropIndicator={null}
      >
        <article>Field content</article>
      </SortableFieldItem>,
    );

    expect(
      screen.getByRole("button", {
        name: "Drag First name",
      }),
    ).toBeInTheDocument();
  });

  it("connects pointer events to the drag handle", () => {
    render(
      <SortableFieldItem
        fieldId="field-1"
        fieldLabel="First name"
        dropIndicator={null}
      >
        <article>Field content</article>
      </SortableFieldItem>,
    );

    fireEvent.pointerDown(
      screen.getByRole("button", {
        name: "Drag First name",
      }),
    );

    expect(
      sortableMocks.onPointerDown,
    ).toHaveBeenCalled();
  });

  it("applies the drag transform and opacity", () => {
    render(
      <SortableFieldItem
        fieldId="field-1"
        fieldLabel="First name"
        dropIndicator={null}
      >
        <article>Field content</article>
      </SortableFieldItem>,
    );

    const listItem =
      screen.getByRole("listitem");

    expect(listItem).toHaveStyle({
      transform:
        "translate3d(10px, 20px, 0)",
      transition:
        "transform 200ms ease",
      opacity: "0.35",
    });

    expect(listItem).toHaveAttribute(
      "data-dragging",
      "true",
    );
  });

  it("renders a drop indicator before the field", () => {
    render(
      <SortableFieldItem
        fieldId="field-1"
        fieldLabel="First name"
        dropIndicator="before"
      >
        <article>Field content</article>
      </SortableFieldItem>,
    );

    const listItem =
      screen.getByRole("listitem");

    expect(
      listItem.firstElementChild,
    ).toHaveClass("mb-2", "bg-accent");
  });

  it("renders a drop indicator after the field", () => {
    render(
      <SortableFieldItem
        fieldId="field-1"
        fieldLabel="First name"
        dropIndicator="after"
      >
        <article>Field content</article>
      </SortableFieldItem>,
    );

    const listItem =
      screen.getByRole("listitem");

    expect(
      listItem.lastElementChild,
    ).toHaveClass("mt-2", "bg-accent");
  });

  it("renders no indicator when nothing is over the field", () => {
    render(
      <SortableFieldItem
        fieldId="field-1"
        fieldLabel="First name"
        dropIndicator={null}
      >
        <article>Field content</article>
      </SortableFieldItem>,
    );

    const listItem =
      screen.getByRole("listitem");

    expect(
      listItem.querySelector(".bg-accent"),
    ).not.toBeInTheDocument();
  });
});