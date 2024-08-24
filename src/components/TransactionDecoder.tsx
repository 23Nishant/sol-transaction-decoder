"use client";

import React, { useState } from "react";
import {
  Connection,
  PublicKey,
  ParsedTransactionWithMeta,
  PartiallyDecodedInstruction,
  ParsedInstruction,
} from "@solana/web3.js";

const SOLANA_NETWORK =
  "https://mainnet.helius-rpc.com/?api-key=339fa552-1c81-40e1-97e1-6cc75178ff57";

export default function TransactionDecoder() {
  const [signature, setSignature] = useState("");
  const [decodedTx, setDecodedTx] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decodeTransaction = async () => {
    setLoading(true);
    setError(null);
    setDecodedTx(null);

    try {
      const connection = new Connection(SOLANA_NETWORK);
      const tx = await connection.getParsedTransaction(signature, "confirmed");

      if (!tx) {
        throw new Error("Transaction not found");
      }

      setDecodedTx(parseTransaction(tx));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const parseTransaction = (tx: ParsedTransactionWithMeta) => {
    return {
      signature: tx.transaction.signatures[0],
      blockTime: tx.blockTime
        ? new Date(tx.blockTime * 1000).toLocaleString()
        : "Unknown",
      fee: tx.meta?.fee,
      instructions: tx.transaction.message.instructions.map(
        (instruction, index) => {
          if ("parsed" in instruction) {
            const parsedInstruction = instruction as ParsedInstruction;
            return {
              programId: parsedInstruction.program,
              type: parsedInstruction.parsed.type,
              info: parsedInstruction.parsed.info,
            };
          } else {
            const partiallyDecodedInstruction =
              instruction as PartiallyDecodedInstruction;
            return {
              programId: partiallyDecodedInstruction.programId.toString(),
              accounts: partiallyDecodedInstruction.accounts.map((account) =>
                account.toString()
              ),
              data: partiallyDecodedInstruction.data,
            };
          }
        }
      ),
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center mb-8">
          Solana Transaction Decoder
        </h1>
        <div className="bg-gray-800 shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label
              htmlFor="signature"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Transaction Signature
            </label>
            <input
              id="signature"
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Enter transaction signature"
              className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={decodeTransaction}
            disabled={loading}
            className="w-full bg-gray-600 text-white p-3 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Decoding..." : "Decode Transaction"}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-900 border border-red-700 text-red-100 rounded">
              {error}
            </div>
          )}
          {decodedTx && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-300 mb-2">
                Decoded Transaction:
              </h2>
              <pre className="p-4 bg-gray-700 rounded-md overflow-auto text-gray-300 whitespace-pre-wrap text-sm">
                {JSON.stringify(decodedTx, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
