'use client';

import React, { useState } from 'react';
import { Connection, PublicKey, ParsedTransactionWithMeta, PartiallyDecodedInstruction, ParsedInstruction } from '@solana/web3.js';

const SOLANA_NETWORK = 'https://mainnet.helius-rpc.com/?api-key=339fa552-1c81-40e1-97e1-6cc75178ff57';

export default function TransactionDecoder() {
  const [signature, setSignature] = useState('');
  const [decodedTx, setDecodedTx] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decodeTransaction = async () => {
    setLoading(true);
    setError(null);
    setDecodedTx(null);

    try {
      const connection = new Connection(SOLANA_NETWORK);
      const tx = await connection.getParsedTransaction(signature, 'confirmed');
      
      if (!tx) {
        throw new Error('Transaction not found');
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
      blockTime: tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'Unknown',
      fee: tx.meta?.fee,
      instructions: tx.transaction.message.instructions.map((instruction, index) => {
        if ('parsed' in instruction) {
          const parsedInstruction = instruction as ParsedInstruction;
          return {
            programId: parsedInstruction.program,
            type: parsedInstruction.parsed.type,
            info: parsedInstruction.parsed.info,
          };
        } else {
          const partiallyDecodedInstruction = instruction as PartiallyDecodedInstruction;
          return {
            programId: partiallyDecodedInstruction.programId.toString(),
            accounts: partiallyDecodedInstruction.accounts.map(account => account.toString()),
            data: partiallyDecodedInstruction.data,
          };
        }
      }),
    };
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Solana Transaction Decoder</h1>
      <div className="mb-4">
        <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Signature
        </label>
        <input
          id="signature"
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Enter transaction signature"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
        />
      </div>
      <button
        onClick={decodeTransaction}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        {loading ? 'Decoding...' : 'Decode Transaction'}
      </button>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {decodedTx && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Decoded Transaction:</h2>
          <pre className="p-4 bg-gray-100 rounded-md overflow-auto text-black whitespace-pre-wrap">
            {JSON.stringify(decodedTx, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}