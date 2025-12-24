"use client";

import { Mail, Phone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface VerificationStatusCardProps {
  emailVerified: boolean;
  phoneVerified: boolean;
  phone: string | null;
  onVerifyEmail: () => void;
  onVerifyPhone: () => void;
}

export function VerificationStatusCard({
  emailVerified,
  phoneVerified,
  phone,
  onVerifyEmail,
  onVerifyPhone,
}: VerificationStatusCardProps) {
  const needsVerification = !emailVerified || !phone || !phoneVerified;

  if (!needsVerification) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-amber-200 bg-amber-50/50 backdrop-blur">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Verificação Pendente
              </h3>
              <p className="text-sm text-amber-700">
                Complete a verificação para ter acesso completo à plataforma.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {!emailVerified && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Email</p>
                    <p className="text-xs text-gray-500">Não verificado</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onVerifyEmail}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Verificar agora
                </Button>
              </div>
            )}

            {(!phone || !phoneVerified) && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Telefone</p>
                    <p className="text-xs text-gray-500">
                      {!phone ? "Não adicionado" : "Não verificado"}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onVerifyPhone}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  {!phone ? "Adicionar agora" : "Verificar agora"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
