"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TaskDTO } from "@/lib/api";
import { TaskRow } from "./TaskRow";

function SortableTaskRow({
  task,
  onToggle,
  onClick,
}: {
  task: TaskDTO;
  onToggle?: (id: string) => void;
  onClick?: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-50" : ""}
      {...attributes}
      {...listeners}
    >
      <TaskRow task={task} onToggle={onToggle} onClick={onClick} />
    </div>
  );
}

interface TaskListProps {
  tasks: TaskDTO[];
  onReorder: (tasks: TaskDTO[]) => void;
  onToggle?: (id: string) => void;
  onClick?: (id: string) => void;
}

export function TaskList({ tasks, onReorder, onToggle, onClick }: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    onReorder(arrayMove(tasks, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <SortableTaskRow key={task.id} task={task} onToggle={onToggle} onClick={onClick} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
