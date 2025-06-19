import {baseApi} from "@/app/baseApi"
import type {BaseResponse} from "@/common/types"
import type {DomainTask, GetTasksResponse, UpdateTaskModel} from "./tasksApi.types"
import {PAGE_SIZE} from "@/common/constants";

export const tasksApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // getTasks: build.query<GetTasksResponse, { todolistId: string, params: { count: number, page: number } }>({
        //     // query: ({todolistId, params}) => `todo-lists/${todolistId}/tasks`,
        //     query: ({todolistId, params}) => ({ url: `todo-lists/${todolistId}/tasks`, params }),
        //
        //     // providesTags: ["Task"],
        //     // providesTags: (result, _error, todolistId) => {
        //     //   return result
        //     //       ? [...result.items.map((task) => ({type: 'Task', id: task.id}) as const), {type: 'Task', id: todolistId}] : [{type: 'Task'}]
        //     // }
        //     providesTags: (_result, _error, {todolistId}) => ([{type: 'Task', id: todolistId}])
        // }),
        getTasks: build.query<GetTasksResponse, { todolistId: string, params: { page: number } }>({
            query: ({todolistId, params}) => ({
                url: `todo-lists/${todolistId}/tasks`,
                params: {...params, count: PAGE_SIZE}
            }),
            keepUnusedDataFor: 5,
            providesTags: (_result, _error, {todolistId}) => ([{type: 'Task', id: todolistId}])
        }),
        addTask: build.mutation<BaseResponse<{ item: DomainTask }>, { todolistId: string; title: string }>({
            query: ({todolistId, title}) => ({
                url: `todo-lists/${todolistId}/tasks`,
                method: "POST",
                body: {title},
            }),
            // invalidatesTags: ["Task"],
            invalidatesTags: (_result, _error, {todolistId}) => [{type: 'Task', id: todolistId}],
        }),
        removeTask: build.mutation<BaseResponse, { todolistId: string; taskId: string }>({
            query: ({todolistId, taskId}) => ({
                url: `todo-lists/${todolistId}/tasks/${taskId}`,
                method: "DELETE",
            }),
            // invalidatesTags: ["Task"],
            // invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Task', id: taskId }],
            invalidatesTags: (_result, _error, {todolistId}) => [{type: 'Task', id: todolistId}],
        }),
        updateTask: build.mutation<
            BaseResponse<{ item: DomainTask }>,
            { todolistId: string; taskId: string; model: UpdateTaskModel }
        >({
            query: ({todolistId, taskId, model}) => ({
                url: `todo-lists/${todolistId}/tasks/${taskId}`,
                method: "PUT",
                body: model,
            }),
            // invalidatesTags: ["Task"],
            // invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Task', id: taskId }],
            invalidatesTags: (_result, _error, {todolistId}) => [{type: 'Task', id: todolistId}],
            onQueryStarted: async ({todolistId, taskId, model}, {dispatch, queryFulfilled, getState}) => {
                const cachedArgsForQuery  = tasksApi.util.selectCachedArgsForQuery(getState(), 'getTasks')

                let patchResults: any[] = []
                cachedArgsForQuery.forEach(( arg ) => {
                    patchResults.push(
                        dispatch(
                            tasksApi.util.updateQueryData(
                                'getTasks',
                                { todolistId, params: { page: arg.params.page } },
                                state => {
                                    const index = state.items.findIndex(task => task.id === taskId)
                                    if (index !== -1) {
                                        state.items[index] = { ...state.items[index], ...model }
                                    }
                                }
                            )
                        )
                    )
                })
                try {
                    await queryFulfilled
                } catch (error) {
                    patchResults.forEach(patchResult => patchResult.undo())
                }
            }
        }),
    }),
})
export const {useGetTasksQuery, useAddTaskMutation, useRemoveTaskMutation, useUpdateTaskMutation} = tasksApi

