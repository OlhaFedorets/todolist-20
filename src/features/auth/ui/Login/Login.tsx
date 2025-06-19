import {selectCaptcha, selectThemeMode, setCaptchaAC, setIsLoggedInAC} from "@/app/app-slice"
import {AUTH_TOKEN} from "@/common/constants"
import {ResultCode} from "@/common/enums"
import {useAppDispatch, useAppSelector} from "@/common/hooks"
import {getTheme} from "@/common/theme"
import {useLazyCaptchaQuery, useLoginMutation} from "@/features/auth/api/authApi"
import {type Inputs, loginSchema, loginWithCaptchaSchema} from "@/features/auth/lib/schemas"
import {zodResolver} from "@hookform/resolvers/zod"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import FormLabel from "@mui/material/FormLabel"
import Grid from "@mui/material/Grid2"
import TextField from "@mui/material/TextField"
import {Controller, type SubmitHandler, useForm} from "react-hook-form"
import styles from "./Login.module.css"

export const Login = () => {
    const themeMode = useAppSelector(selectThemeMode)
    const captchaUrl = useAppSelector(selectCaptcha)

    const [login] = useLoginMutation()
    const [trigger] = useLazyCaptchaQuery()

    const dispatch = useAppDispatch()

    const theme = getTheme(themeMode)

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: {errors},
    } = useForm<Inputs>({
        // resolver: zodResolver(loginSchema),
        resolver: zodResolver(captchaUrl ? loginWithCaptchaSchema : loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
            captcha: ""
        },
    })

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        const requestData = captchaUrl ? {...data, captcha: data.captcha} : data
        login(requestData).then((res) => {
            if (res.data?.resultCode === ResultCode.Success) {
                dispatch(setIsLoggedInAC({isLoggedIn: true}))
                localStorage.setItem(AUTH_TOKEN, res.data.data.token)
                reset()
                dispatch(setCaptchaAC({url: null}))
            } else if (res.data?.resultCode === ResultCode.CaptchaError) {
                trigger().unwrap().then(captcha => {
                    captcha?.url && dispatch(setCaptchaAC({url: captcha?.url}))
                })
            }
        })
    }

    return (
        <Grid container justifyContent={"center"}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl>
                    <FormLabel>
                        <p>
                            To login get registered
                            <a
                                style={{color: theme.palette.primary.main, marginLeft: "5px"}}
                                href="https://social-network.samuraijs.com"
                                target="_blank"
                                rel="noreferrer"
                            >
                                here
                            </a>
                        </p>
                        <p>or use common test account credentials:</p>
                        <p>
                            <b>Email:</b> free@samuraijs.com
                        </p>
                        <p>
                            <b>Password:</b> free
                        </p>
                    </FormLabel>
                    <FormGroup>
                        <TextField label="Email" margin="normal" error={!!errors.email} {...register("email")} />
                        {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
                        <TextField
                            type="password"
                            label="Password"
                            margin="normal"
                            error={!!errors.password}
                            {...register("password")}
                        />
                        {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
                        <FormControlLabel
                            label={"Remember me"}
                            control={
                                <Controller
                                    name={"rememberMe"}
                                    control={control}
                                    render={({field: {value, ...field}}) => <Checkbox {...field} checked={value}/>}
                                />
                            }
                        />
                        {captchaUrl && (<>
                                <img src={captchaUrl}/>
                                <TextField id="outlined-basic"
                                           label="Enter captcha"
                                           error={!!errors.captcha}
                                           variant="outlined"
                                           {...register("captcha")}/>
                            </>
                        )}
                        <Button type="submit" variant="contained" color="primary">
                            Login
                        </Button>
                    </FormGroup>
                </FormControl>
            </form>
        </Grid>
    )
}

// export const Login = () => {
//     const themeMode = useAppSelector(selectThemeMode)
//     const captchaUrl = useAppSelector(selectCaptcha)
//
//     const [login] = useLoginMutation()
//     const [fetchCaptcha] = useLazyCaptchaQuery() // Переименовал trigger в fetchCaptcha для ясности
//
//     const dispatch = useAppDispatch()
//     const theme = getTheme(themeMode)
//
//     const {
//         register,
//         handleSubmit,
//         reset,
//         control,
//         formState: { errors },
//     } = useForm<Inputs>({
//         resolver: zodResolver(captchaUrl ? loginWithCaptchaSchema : loginSchema),
//         defaultValues: {
//             email: "",
//             password: "",
//             rememberMe: false,
//             captcha: "" // Добавляем поле для капчи
//         },
//     })
//
//     const onSubmit: SubmitHandler<Inputs> = async (data) => {
//         try {
//             // Если есть URL капчи, включаем captcha в данные для отправки
//             const requestData = captchaUrl
//                 ? { ...data, captcha: data.captcha }
//                 : data
//
//             const res = await login(requestData)
//
//             if (res.data?.resultCode === ResultCode.Success) {
//                 dispatch(setIsLoggedInAC({ isLoggedIn: true }))
//                 localStorage.setItem(AUTH_TOKEN, res.data.data.token)
//                 reset()
//                 dispatch(setCaptchaAC({ url: null })) // Очищаем капчу после успешного входа
//             } else if (res.data?.resultCode === ResultCode.CaptchaError) {
//                 // Запрашиваем новую капчу только при ошибке
//                 const captchaRes = await fetchCaptcha().unwrap()
//                 captchaRes?.url && dispatch(setCaptchaAC({ url: captchaRes.url }))
//             }
//         } catch (error) {
//             console.error('Login error:', error)
//         }
//     }
//
//     return (
//         <Grid container justifyContent={"center"}>
//             <form onSubmit={handleSubmit(onSubmit)}>
//                 <FormControl>
//                     <FormLabel>
//                         <p>
//                             To login get registered
//                             <a
//                                 style={{ color: theme.palette.primary.main, marginLeft: "5px" }}
//                                 href="https://social-network.samuraijs.com"
//                                 target="_blank"
//                                 rel="noreferrer"
//                             >
//                                 here
//                             </a>
//                         </p>
//                         <p>or use common test account credentials:</p>
//                         <p>
//                             <b>Email:</b> free@samuraijs.com
//                         </p>
//                         <p>
//                             <b>Password:</b> free
//                         </p>
//                     </FormLabel>
//                     <FormGroup>
//                         <TextField
//                             label="Email"
//                             margin="normal"
//                             error={!!errors.email}
//                             {...register("email")}
//                         />
//                         {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
//
//                         <TextField
//                             type="password"
//                             label="Password"
//                             margin="normal"
//                             error={!!errors.password} // Исправлено на errors.password
//                             {...register("password")}
//                         />
//                         {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
//
//                         <FormControlLabel
//                             label={"Remember me"}
//                             control={
//                                 <Controller
//                                     name={"rememberMe"}
//                                     control={control}
//                                     render={({ field: { value, ...field } }) => (
//                                         <Checkbox {...field} checked={value} />
//                                     )}
//                                 />
//                             }
//                         />
//
//                         {/* Блок капчи */}
//                         {captchaUrl && (
//                             <>
//                                 <img src={captchaUrl} alt="Captcha" />
//                                 <TextField
//                                     label="Enter captcha"
//                                     margin="normal"
//                                     error={!!errors.captcha}
//                                     {...register("captcha")}
//                                 />
//                                 {errors.captcha && (
//                                     <span className={styles.errorMessage}>{errors.captcha.message}</span>
//                                 )}
//                             </>
//                         )}
//
//                         <Button
//                             type="submit"
//                             variant="contained"
//                             color="primary"
//                             fullWidth
//                         >
//                             Login
//                         </Button>
//                     </FormGroup>
//                 </FormControl>
//             </form>
//         </Grid>
//     )
// }