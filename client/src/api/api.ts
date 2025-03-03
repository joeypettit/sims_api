import { ProjectArea } from "../app/types/project-area";
import { Project } from "../app/types/project";
import axios from "axios";
import type { LineItemOption } from "../app/types/line-item-option";
import type { LineItem } from "../app/types/line-item";
import type { GroupCategory } from "../app/types/group-category";
import type { LineItemUnit } from "../app/types/line-item-unit";
import type { AreaTemplate } from "../app/types/area-template";
import { LineItemGroup } from "../app/types/line-item-group";
import { User, LoginCredentials, UserRole } from "../app/types/user";
import { Client } from "../app/types/client";
import { PriceRange } from "../app/types/price-range";
import { QueryClient } from "@tanstack/react-query";

type SearchProjectsResponse = {
  projects: Project[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };
};

export async function getAllProjects(): Promise<Project[]> {
  const response = await axios.get<Project[]>("/api/projects");
  console.log("data", response.data);
  return response.data; // Return the actual data, which will be typed as `Project[]`
}

export async function getProjectById(id: string) {
  try {
    const response = await axios.get<Project>(`/api/projects/get-by-id/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching project with id ${id}: ${error}`);
  }
}

export async function getProjectAreaById(areaId: string) {
  try {
    const response = await axios.get<ProjectArea>(`/api/project-areas/${areaId}`);
    console.log('getting area', response.data)
    return response.data;

  } catch (error) {
    console.error(`Error getting project area by id with id ${areaId}`, error);
    throw new Error(`Failed to update line item option selection`);
  }
}

export async function updateOptionSelection({
  optionToSelect,
  optionToUnselect,
  lineItem,
}: {
  optionToSelect: LineItemOption | undefined;
  optionToUnselect: LineItemOption | undefined;
  lineItem: LineItem;
}) {
  console.log("in mutation", optionToSelect, optionToUnselect);
  try {
    let unselectResponse = undefined;
    let selectResponse = undefined;

    if (optionToUnselect) {
      unselectResponse = await axios.put(
        `/api/line-items/${lineItem.id}/unselect-option/${optionToUnselect.id}`
      );
    }
    if (optionToSelect) {
      selectResponse = await axios.put(
        `/api/line-items/${lineItem.id}/select-option/${optionToSelect.id}`
      );
    }
    console.log("in mutation", unselectResponse, selectResponse);

    const newOptions: LineItemOption[] = lineItem.lineItemOptions.map(
      (option) => {
        if (unselectResponse && option.id === unselectResponse.data.id) {
          return unselectResponse.data;
        }
        if (selectResponse && option.id === selectResponse.data.id) {
          return selectResponse.data;
        }
        return option;
      }
    );

    return newOptions;
  } catch (error) {
    console.error("Error updating line item option selection:", error);
    throw new Error("Failed to update line item option selection");
  }
}

export const updateLineItemQuantity = async ({
  lineItemId,
  quantity,
}: {
  lineItemId: string;
  quantity: number;
}) => {
  const response = await axios.put(
    `/api/line-items/${lineItemId}/update-quantity`,
    {
      quantity,
    }
  );

  return response.data;
};

export const getAllGroupCategories = async () => {
  try {
    const response = await axios.get<GroupCategory[]>(
      `/api/groups/all-categories`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting all group categories:", error);
    throw new Error("Error getting all group categories");
  }
};

export async function createAreaTemplate(templateName: string) {
  try {
    const response = await axios.post<AreaTemplate>(
      `/api/templates/area/create`,
      {
        name: templateName,
      }
    );
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error Creating New Area Template wiht name ${templateName}: ${error}`
    );
  }
}

export async function getAreaTemplate(templateId: string) {
  try {
    const response = await axios.get<AreaTemplate>(
      `/api/templates/area/${templateId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      `Error getting area template is ID ${templateId}: ${error}`
    );
  }
}

export async function createGroup({
  categoryId,
  groupName,
  projectAreaId,
}: {
  categoryId: string;
  groupName: string;
  projectAreaId: string;
}) {
  try {
    const response = await axios.post(`/api/groups`, {
      categoryId,
      groupName,
      projectAreaId,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Error creating new group in category with ID ${categoryId}: ${error}`
    );
  }
}

export async function getUnits() {
  try {
    const response = await axios.get<LineItemUnit[]>("/api/units");
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching line item units: ${error}`);
  }
}

export async function createUnit({ unitName }: { unitName: string }) {
  try {
    const response = await axios.post(`/api/units`, {
      unitName,
    });
    console.log("create unit response", response.data);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating new unit: ${error}`);
  }
}

export async function deleteUnit(unitId: string): Promise<void> {
  try {
    await axios.delete(`/api/units/${unitId}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Failed to delete unit');
    }
    throw new Error('Failed to delete unit');
  }
}

export async function createBlankLineItem({ groupId }: { groupId: string }) {
  try {
    const response = await axios.post(`/api/line-items/create-blank`, {
      groupId,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error creating new line Item: ${error}`);
  }
}

export async function getLineItem(lineItemId: string): Promise<LineItem> {
  try {
    const response = await axios.get<LineItem>(`/api/line-items/${lineItemId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching line item with ID ${lineItemId}: ${error}`);
  }
}

export async function updateLineItem({
  name,
  lineItemId,
  groupId,
  quantity,
  unitId,
  marginDecimal,
  lineItemOptions,
}: {
  name?: string;
  lineItemId: string;
  groupId?: string;
  quantity?: number;
  unitId?: string;
  marginDecimal?: number;
  lineItemOptions?: LineItemOption[];
}) {
  try {
    const response = await axios.put(`/api/line-items/${lineItemId}`, {
      name,
      quantity,
      groupId,
      unitId,
      marginDecimal,
      lineItemOptions,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error updating line item with ID ${lineItemId}: ${error}`);
  }
}

export async function deleteLineItem({ lineItemId }: { lineItemId: string }) {
  try {
    const response = await axios.delete(`/api/line-items/${lineItemId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error deleting line item with ID ${lineItemId}: ${error}`);
  }
}

export async function createBlankProject({ name }: { name: string }) {
  try {
    const currentUser = await getCurrentUser();
    const response = await axios.post(`/api/projects/create-blank`, { 
      name,
      userId: currentUser.id 
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error creating new project: ${error}`);
  }
}

export async function createBlankProjectArea({
  name,
  projectId,
}: {
  name: string;
  projectId: string;
}) {
  try {
    const response = await axios.post(`/api/project-areas/create-blank`, {
      name,
      projectId,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error creating new blank project area: ${error}`);
  }
}

export async function getAllAreaTemplates() {
  try {
    const response = await axios.get<AreaTemplate[]>(
      "/api/templates/area/all-templates"
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching line item units: ${error}`);
  }
}

export async function createAreaFromTemplate({
  name,
  projectId,
  templateId,
}: {
  name: string;
  projectId: string;
  templateId: string;
}) {
  try {
    const response = await axios.post(
      `/api/project-areas/create-from-template`,
      {
        name,
        projectId,
        templateId,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error creating new project area from template: ${error}`);
  }
}

export async function setGroupIsOpen({
  groupId,
  isOpen,
}: {
  groupId: string;
  isOpen: boolean;
}) {
  const response = await axios.put<LineItemGroup>(
    `/api/groups/${groupId}/update-isopen`,
    {
      isOpen,
    }
  );
  return response.data;
};

export async function setIsOpenOnAllGroupsInArea({
  areaId,
  isOpen,
}: {
  areaId: string;
  isOpen: boolean;
}) {
  console.log("isOpen", isOpen)
  const response = await axios.put<ProjectArea>(
    `/api/groups/update-isopen-by-area`,
    {
      areaId,
      isOpen,
    }
  );
  return response.data;
};

export async function setIndexOfGroupInCategory({
  categoryId,
  groupId,
  newIndex
}: {
  categoryId: string;
  groupId: string;
  newIndex: number;
}) {
  console.log("setting group index", categoryId, groupId, newIndex)
  try {
    const response = await axios.put<LineItemGroup>(
      `/api/groups/${groupId}/set-index-in-category`,
      {
        categoryId,
        groupId,
        newIndex
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error setting index of group in category. GroupId:${groupId}: ${error}`);
  }
};

export async function setLineItemIndex({
  groupId,
  lineItemId,
  newIndex
}: {
  groupId: string;
  lineItemId: string;
  newIndex: number;
}) {
  try {
    const response = await axios.put<LineItem>(
      `/api/line-items/${lineItemId}/set-index`,
      {
        groupId,
        newIndex
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error setting index of line item. LineItemId:${lineItemId}: ${error}`);
  }
};

export async function searchProjects({ 
  query = "", 
  page = "1", 
  limit = "10" 
}: { 
  query?: string, 
  page?: string, 
  limit?: string 
}) {
  try {
    const response = await axios.get<SearchProjectsResponse>(`/api/projects/search`, {
      params: { query, page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error searching projects: ${error}`);
  }
}

export async function login(credentials: LoginCredentials) {
  try {
    const response = await axios.post<User>('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('Invalid email or password');
    }
    throw new Error('Failed to login. Please try again.');
  }
}

export async function logout() {
  try {
    await axios.post('/api/auth/logout');
  } catch (error) {
    throw new Error('Failed to logout');
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await axios.get('/api/auth/me');
    return response.data;
  } catch (error) {
    throw new Error('Failed to get current user');
  }
}

export async function getUsers({ 
  page = "1", 
  limit = "10" 
}: { 
  page?: string, 
  limit?: string 
} = {}): Promise<{
  users: User[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };
}> {
  try {
    console.log('Getting users');
    const response = await axios.get('/api/auth/users', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to get users');
  }
}

export async function getUser(userId: string): Promise<User> {
  try {
    const response = await axios.get<User>(`/api/auth/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to get user details');
  }
}

export async function updateUser({
  userId,
  firstName,
  lastName,
  email,
  role,
}: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}): Promise<User> {
  try {
    const response = await axios.put<User>(`/api/auth/users/${userId}`, {
      firstName,
      lastName,
      email,
      role,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Failed to update user');
    }
    throw new Error('Failed to update user');
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await axios.delete(`/api/auth/users/${userId}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Failed to delete user');
    }
    throw new Error('Failed to delete user');
  }
}

export async function createUser({
  firstName,
  lastName,
  email,
  password,
  role,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<User> {
  try {
    console.log('Creating user', { firstName, lastName, email, password, role });
    const response = await axios.post<User>('/api/auth/create-user', {
      firstName,
      lastName,
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Failed to create user');
    }
    throw new Error('Failed to create user');
  }
}

export async function toggleUserBlocked(userAccountId: string): Promise<User> {
  try {
    const response = await axios.patch<{ message: string, user: User }>(`/api/auth/users/${userAccountId}/toggle-block`);
    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Failed to toggle user blocked status');
    }
    throw new Error('Failed to toggle user blocked status');
  }
}

export async function resetUserPassword(userAccountId: string): Promise<{ message: string, temporaryPassword: string }> {
  try {
    const response = await axios.post<{ message: string, temporaryPassword: string }>(
      `/api/auth/users/${userAccountId}/reset-password`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Failed to reset user password');
    }
    throw new Error('Failed to reset user password');
  }
}

export async function searchUsers({ 
  query = "", 
  page = "1", 
  limit = "10" 
}: { 
  query?: string, 
  page?: string, 
  limit?: string 
} = {}): Promise<{
  users: User[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };
}> {
  try {
    const response = await axios.get('/api/auth/users/search', {
      params: { query, page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to search users');
  }
}

export async function addUserToProject(projectId: string, userId: string) {
  try {
    const response = await axios.post(`/api/projects/${projectId}/users`, { userId });
    return response.data;
  } catch (error) {
    throw new Error('Failed to add user to project');
  }
}

export async function removeUserFromProject(projectId: string, userId: string) {
  try {
    const response = await axios.delete(`/api/projects/${projectId}/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to remove user from project');
  }
}

export type SearchClientsResponse = {
  clients: Client[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };
};

export async function searchClients({ 
  query = "", 
  page = "1", 
  limit = "10" 
}: { 
  query?: string, 
  page?: string, 
  limit?: string 
} = {}): Promise<SearchClientsResponse> {
  try {
    const response = await axios.get('/api/clients/search', {
      params: { query, page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to search clients');
  }
}

export async function getClient(clientId: string): Promise<Client> {
  try {
    const response = await axios.get<Client>(`/api/clients/${clientId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to get client');
  }
}

export async function createClient({
  firstName,
  lastName,
  email,
  phone
}: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}): Promise<Client> {
  try {
    const response = await axios.post('/api/clients', {
      firstName,
      lastName,
      email,
      phone
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create client');
  }
}

export async function updateClient({
  clientId,
  firstName,
  lastName,
  email,
  phone
}: {
  clientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}): Promise<Client> {
  try {
    const response = await axios.put(`/api/clients/${clientId}`, {
      firstName,
      lastName,
      email,
      phone
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update client');
  }
}

export async function deleteClient(clientId: string): Promise<void> {
  try {
    await axios.delete(`/api/clients/${clientId}`);
  } catch (error) {
    throw new Error('Failed to delete client');
  }
}

export async function addClientToProject(projectId: string, clientId: string) {
  try {
    const response = await axios.post(`/api/projects/${projectId}/clients`, { clientId });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add client to project: ${error}`);
  }
}

export async function removeClientFromProject(projectId: string, clientId: string) {
  try {
    const response = await axios.delete(`/api/projects/${projectId}/clients/${clientId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to remove client from project: ${error}`);
  }
}

export async function deleteProjectArea(areaId: string) {
  try {
    const response = await axios.delete(`/api/project-areas/${areaId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error deleting project area: ${error}`);
  }
}

export async function getProjectCostRange(projectId: string): Promise<PriceRange> {
  try {
    const response = await axios.get<PriceRange>(`/api/projects/${projectId}/cost-range`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to get project cost range');
  }
}

export async function getAreaCostRange(areaId: string): Promise<PriceRange> {
  try {
    const response = await axios.get<PriceRange>(`/api/project-areas/${areaId}/cost-range`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to get area cost range');
  }
}

export async function changePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const response = await axios.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error === 'Current password is incorrect') {
      throw new Error('The current password you entered is incorrect. Please try again.');
    }
    throw new Error('Failed to change password. Please try again.');
  }
}

export async function updateProjectDates(projectId: string, startDate: Date | null, endDate: Date | null) {
  try {
    const response = await axios.patch(`/api/projects/${projectId}/dates`, {
      startDate,
      endDate
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update project dates');
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    await axios.delete(`/api/projects/${projectId}`);
  } catch (error) {
    throw new Error('Failed to delete project');
  }
}

export async function deleteTemplate(templateId: string): Promise<void> {
  try {
    await axios.delete(`/api/templates/area/${templateId}`);
  } catch (error) {
    throw new Error('Failed to delete template');
  }
}

export async function starProject(projectId: string) {
  try {
    const response = await axios.post(`/api/projects/${projectId}/star`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to star project');
  }
}

export async function unstarProject(projectId: string) {
  try {
    await axios.delete(`/api/projects/${projectId}/star`);
  } catch (error) {
    throw new Error('Failed to unstar project');
  }
}

export async function isProjectStarred(projectId: string) {
  try {
    const response = await axios.get(`/api/projects/${projectId}/star`);
    return response.data.isStarred;
  } catch (error) {
    throw new Error('Failed to check project star status');
  }
}

export async function searchMyProjects({ 
  query = "", 
  page = "1", 
  limit = "10" 
}: { 
  query?: string, 
  page?: string, 
  limit?: string 
}) {
  try {
    const response = await axios.get<SearchProjectsResponse>(`/api/projects/my-projects`, {
      params: { query, page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error searching my projects: ${error}`);
  }
}
