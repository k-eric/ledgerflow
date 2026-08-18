import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { DollarSign, CreditCard, Users, CheckCircle, RefreshCw } from 'lucide-react'

export default function App() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch payments from Supabase ordered by payment_date
  const fetchPayments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false })

    if (error) {
      console.error('Error fetching payments:', error)
    } else {
      console.log('Fetched payments:', data)
      setPayments(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  // Calculate totals matching database column 'amount_paid'
  const totalRevenue = payments.reduce((acc, curr) => acc + (Number(curr.amount_paid || curr.amount) || 0), 0)
  const totalTransactions = payments.length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">LedgerFlow</h1>
          <p className="text-slate-500 text-sm mt-1">Landlord M-Pesa Payment Dashboard</p>
        </div>
        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition text-sm font-medium shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Collected</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                KES {totalRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Transactions</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalTransactions}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">System Status</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" /> Active
              </h3>
            </div>
            <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Recent Payment Transactions</h2>
            <span className="text-xs text-slate-400">Live Supabase Sync</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No payment records found in database yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                    <th className="p-4 pl-6">Transaction Code</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Amount (KES)</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4 pr-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p, index) => (
                    <tr key={p.id || index} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 pl-6 font-mono font-medium text-slate-900">
                        {p.transaction_reference || p.mpesa_code || 'N/A'}
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        {p.payment_method || 'M-Pesa'}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        KES {Number(p.amount_paid || p.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-slate-500 text-xs">
                        {p.payment_date ? new Date(p.payment_date).toLocaleString() : 'Just now'}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}