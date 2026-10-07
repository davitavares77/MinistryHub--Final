"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import {useForm} from "react-hook-form";
import { SignInSchema, signUpFormSchema, SignUpFormSchema } from "../_schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { signInSchema } from "../_schemas/auth-schemas"
import { useRouter } from "next/navigation";
import "./login.css"
import imagemMinistry from "../../components/ui/IMG_6960-removebg-preview.png"
import Link from "next/link";
import Spinner from "./spinner";

type FormData = {
    nome: string;
    email: string;
    senha: string;
}

export default function Login() {
    const router = useRouter();
    const [loginError, setLoginError] = useState<string | null>(null);
    const [entrando, setEntrando] = useState(false);
    const {register, handleSubmit, formState: {errors}} = useForm<SignInSchema>({resolver: zodResolver(signInSchema),

    });

async function onSubmit(data: SignInSchema) {
  setLoginError(null);
  setEntrando(true);

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });

  if (authError) {
    if (authError.message === "Invalid login credentials") {
      setLoginError("Email ou senha incorretos");
    } else if (authError.message === "Email not confirmed") {
      setLoginError("Confirme seu email antes de fazer login");
    } else {
      setLoginError("Erro ao fazer login. Tente novamente.");
    }
    console.error(authError);
    setEntrando(false);
    return;
  }

  // busca o cargo do usuário pra decidir pra onde redirecionar
  const { data: usuario } = await supabase
    .from("usuario")
    .select("cargo")
    .eq("email", data.email)
    .single();

  // não desliga o "entrando" aqui de propósito — a tela vai trocar
  // (window.location.href) então o spinner continua até a troca acontecer

  if (usuario?.cargo === "admin") {
    window.location.href = "/configurar";
  } else {
    window.location.href = "/disponibilidade";
  }
}
    return(

        <> <div className="imagemfundo"><img src="/IMG_7461.png" alt="" /></div>
        
        
            <div className="forms">
                <div className="logoministry"><img src={imagemMinistry.src}/></div>
             <div className="azul">
                <p className="titulo">Login</p>
                <p className="normal">Faça Login para acessar o sistema</p>
        <form onSubmit={handleSubmit(onSubmit)}>
        
            
                <h2>Email</h2>
            <Input className="input" placeholder="you@example.com" type="email" {...register("email")} disabled={entrando}/>
        
                    {errors?.email && (
                <div className="text-red-500 text-xs">
                    {errors?.email?.message}
                </div>
                    )}
            <h2>Senha</h2>
            <Input className="input" placeholder="••••••••" type="password" {...register("password")} disabled={entrando} />
        
                    {errors?.password && (
                <div className="text-red-500 text-xs">
                    {errors?.password?.message}
                </div>
                     )}

                {loginError && (
                <div className="text-red-500 text-xs">{loginError}</div>
                )}
        <Button disabled={entrando}>
          {entrando ? (<><Spinner /> Entrando...</>) : "Logar"}
        </Button>
            <div className="final">
                <span>ou</span>
                <h3>Novo no MinistryHub? <a href="/cadastro">Crie sua conta</a></h3>
                </div>
        
            </form>
        </div>  
    </div>
        
        </>
        
    )
}