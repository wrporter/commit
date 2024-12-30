import { type Group } from "#app/lib/models/group.server";
import { type Person } from "#app/lib/models/person.server";
import { type Task } from "#app/lib/models/task.server";
import { type User } from "#app/lib/models/user.server";
import { prisma } from "#app/prisma.server";

export interface Chart {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  groups?: Group[];
  people?: Person[];
  tasks?: Task[];
  // taskAssignments: TaskAssignment[]
  // taskRewards: TaskReward[]
  // taskStatuses: TaskStatus[]
  // commissions: Commission[]
}

export async function createChart(groupId: Group["id"], name: Chart["name"]) {
  return prisma.chart.create({
    data: {
      name,
      groups: { connect: { id: groupId } },
    },
  });
}

// TODO: Make sure users can only update when they have permission
export async function updateChart(
  id: Chart["id"],
  name: Chart["name"],
  peopleIds?: Person["id"][]
) {
  return prisma.chart.update({
    where: { id },
    data: {
      name,
      people: peopleIds
        ? { set: [], connect: peopleIds.map((id) => ({ id })) }
        : undefined,
    },
  });
}

export async function deleteChart(id: Chart["id"]) {
  return prisma.chart.delete({
    where: { id },
  });
}

export async function getChartsForUser(userId: User["id"]) {
  return prisma.chart.findMany({
    where: { groups: { every: { owners: { every: { id: userId } } } } },
    include: {
      groups: true,
      people: true,
      tasks: true,
      commissions: true,
      taskRewards: true,
      taskStatuses: true,
      taskAssignments: true,
    },
  });
}

export async function getChartForUser(userId: User["id"], id: Chart["id"]) {
  return prisma.chart.findFirst({
    where: { id, groups: { every: { owners: { every: { id: userId } } } } },
    include: {
      groups: true,
      people: true,
      tasks: true,
      commissions: true,
      taskRewards: true,
      taskStatuses: true,
      taskAssignments: true,
    },
  });
}
