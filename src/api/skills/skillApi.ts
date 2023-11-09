import { Skill } from 'src/types/skill';
import { deepCopy } from 'src/utils/deep-copy';
import { applySort } from 'src/utils/apply-sort';
import { applyPagination } from 'src/utils/apply-pagination';

const STORAGE_KEY = 'skills';
const getPersistedSkills = (): Skill[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data) as Skill[];
  } catch (err) {
    console.error(err);
    return [];
  }
};

const persistSkill = (user: Skill): void => {
  try {
    const usersData = getPersistedSkills();
    const data = JSON.stringify([...usersData, user]);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (err) {
    console.error(err);
  }
};

type GetSkillsRequest = {
  filters?: {
    query?: string;
  };
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

type GetSkillsResponse = Promise<{
  data: Skill[];
  count: number;
}>;

class SkillsApi {
  getSkills(request: GetSkillsRequest = {}): GetSkillsResponse {
    const { filters, page, rowsPerPage, sortBy, sortDir } = request;

    let data = deepCopy(getPersistedSkills()) as Skill[];
    let count = data.length;

    if (typeof filters !== 'undefined') {
      data = data.filter((skill) => {
        if (typeof filters.query !== 'undefined' && filters.query !== '') {
          let queryMatched = false;

          if (skill.label.toLowerCase().includes(filters.query!.toLowerCase())) {
            queryMatched = true;
          }

          if (!queryMatched) {
            return false;
          }
        }

        return true;
      });
      count = data.length;
    }

    if (typeof sortBy !== 'undefined' && typeof sortDir !== 'undefined') {
      data = applySort(data, sortBy, sortDir);
    }

    if (typeof page !== 'undefined' && typeof rowsPerPage !== 'undefined') {
      data = applyPagination(data, page, rowsPerPage);
    }

    return Promise.resolve({
      data,
      count,
    });
  }

  saveSkill(skill: Skill) {
    persistSkill(skill);
  }
}

export const skillsApi = new SkillsApi();
