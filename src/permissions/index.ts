import { ApplicationCommandPermissionData } from 'discord.js';

interface permissionTypes {
  [key: string]: ApplicationCommandPermissionData[];
}

const managerPermission = (id: string): ApplicationCommandPermissionData => ({
  type: 'ROLE',
  id,
  permission: true,
});

const permissions = (id: string): permissionTypes => ({
  alias: [managerPermission(id)], // Manager
  allowjoin: [managerPermission(id)], // Manager
  allyourbase: [managerPermission(id)], // Manager
  bitrate: [], // Anyone
  create: [managerPermission(id)], // Manager
  general: [managerPermission(id)], // Manager
  help: [], // Anyone
  info: [], // Anyone
  join: [], // Anyone
  limit: [], // Anyone
  lock: [], // Anyone
  name: [], // Manager
  permission: [managerPermission(id)], // Manager
  ping: [], // Anyone
  template: [managerPermission(id)], // Manager
  transfer: [], // Anyone
  unlock: [], // Anyone
  version: [], // Anyone
});

export default permissions;
