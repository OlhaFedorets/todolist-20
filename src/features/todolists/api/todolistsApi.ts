import {baseApi} from "@/app/baseApi"
import type {BaseResponse} from "@/common/types"
import type {DomainTodolist} from "@/features/todolists/lib/types"
import {Todolist, TodolistSchema} from "./todolistsApi.types"

export const todolistsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getTodolists: build.query<DomainTodolist[], void>({
            query: () => "todo-lists",
            transformResponse: (todolists: Todolist[]): DomainTodolist[] =>
                todolists.map((todolist) => ({...todolist, filter: "all", entityStatus: "idle"})),
            extraOptions: {dataSchema: TodolistSchema.array()},
            providesTags: ["Todolist"],
        }),
        addTodolist: build.mutation<BaseResponse<{ item: Todolist }>, string>({
            query: (title) => ({
                url: "todo-lists",
                method: "POST",
                body: {title},
            }),
            invalidatesTags: ["Todolist"],
        }),
        removeTodolist: build.mutation<BaseResponse, string>({
            query: (id) => ({
                //4
                url: `todo-lists/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Todolist"],
            onQueryStarted: async (todolistId, {dispatch, queryFulfilled}) => {
                //1
                const patchResult = dispatch(
                    todolistsApi.util.updateQueryData("getTodolists", undefined, (state) => {
                        //2
                        const index = state.findIndex(todo => todo.id === todolistId)
                        if (index !== -1) state.splice(index, 1)
                    }),
                )
                try {
                    //3
                    await queryFulfilled
                    //5
                } catch (err) {
                    //5
                    patchResult.undo()
                }
            },
        }),
        updateTodolistTitle: build.mutation<BaseResponse, { id: string; title: string }>({
            query: ({id, title}) => ({
                url: `todo-lists/${id}`,
                method: "PUT",
                body: {title},
            }),
            invalidatesTags: ["Todolist"],
        }),
    }),
})

export const {
    useGetTodolistsQuery,
    useAddTodolistMutation,
    useRemoveTodolistMutation,
    useUpdateTodolistTitleMutation,
} = todolistsApi
