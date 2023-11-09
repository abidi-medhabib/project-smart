import { Project } from "src/types/project";
import { projects } from "./data";
import { deepCopy } from "src/utils/deep-copy";
import { applySort } from "src/utils/apply-sort";
import { applyPagination } from "src/utils/apply-pagination";

type GetProjectsRequest = {
  filters?: {
    query?: string;
  };
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

type GetProjectsResponse = Promise<{
  data: Project[];
  count: number;
}>;

class ProjectsApi {
  getProjects(request: GetProjectsRequest = {}): GetProjectsResponse {
    const { filters, page, rowsPerPage, sortBy, sortDir } = request;

    let data = deepCopy(projects) as Project[];
    let count = data.length;

    if (typeof filters !== 'undefined') {
      data = data.filter((project) => {
        if (typeof filters.query !== 'undefined' && filters.query !== '') {
          let queryMatched = false;

          if (project.name.toLowerCase().includes(filters.query!.toLowerCase())) {
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
}

export const projectsApi = new ProjectsApi();
