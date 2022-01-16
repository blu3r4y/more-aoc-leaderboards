import { IApiData, IApiMember } from "./ApiTypes";

export declare interface IMember extends IPreMember {}

declare interface IPreMember {
  name: string;
  local_score: number;
}

export function processData(apiData: IApiData | null): IMember[] | null {
  if (!apiData) return null;

  const { members: apiMembers } = apiData;

  // retrieve metadata in a two-pass process
  const preMembers = Object.values(apiMembers).map((m) => preprocessMember(m));
  const members = preMembers.map((m) => processMember(m, preMembers));

  console.log(members);
  return members;
}

/**
 * computes leaderboard metadata for a single member
 *
 * @param member the raw `IApiMember` object
 * @param year the event year
 * @returns an `IPreMember` object holding additional metadata
 */
function preprocessMember(member: IApiMember): IPreMember {
  return { name: member.name ?? `#${member.id}`, local_score: member.local_score };
}

/**
 * computes leaderboard metadata for a member, in context of all members
 *
 * @param member a preprocessed `IPreMember` object
 * @param members a list of all (including, `member`) preprocessed `IPreMember` objects
 * @returns an `IMember` object holding the original metadata plus additional metadata
 */
function processMember(member: IPreMember, members: IPreMember[]): IMember {
  return { ...member };
}
