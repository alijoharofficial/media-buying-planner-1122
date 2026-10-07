import { div, step, val } from './steps';
import type { BusinessType, EcomBusiness, LeadBusiness, RateSource, Stepped } from './types';

export type LeadLimits = {
  kind: 'leads';
  profitPerClient: number;
  bookingRate: number;
  showRate: number;
  closeRate: number;
  leadToClient: number;
  maxCAC: number;
  targetCAC: number;
  maxCPL: number;
  targetCPL: number;
};

export type EcomLimits = {
  kind: 'ecommerce';
  profitPerOrder: number;
  breakEvenCPA: number;
  breakEvenROAS: number;
  targetCPA: number;
};

export type Limits = LeadLimits | EcomLimits;

export const leadToClientRate = (booking: number, show: number, close: number) => booking * show * close;

/** 9.1 Leads. Rates may come from CRM data (existing accounts) or business inputs. */
export function leadLimits(b: LeadBusiness, profitBuffer: number, rateSource: RateSource = b.rateSource ?? 'estimate'): Stepped<LeadLimits> {
  const profitPerClient = b.clientValue * b.margin;
  const leadToClient = leadToClientRate(b.bookingRate, b.showRate, b.closeRate);
  const maxCAC = profitPerClient;
  const targetCAC = maxCAC / (1 + profitBuffer);
  const maxCPL = maxCAC * leadToClient;
  const targetCPL = targetCAC * leadToClient;
  const rateTag = rateSource === 'crm' ? 'input' : 'assumption';

  return {
    kind: 'leads',
    profitPerClient,
    bookingRate: b.bookingRate,
    showRate: b.showRate,
    closeRate: b.closeRate,
    leadToClient,
    maxCAC,
    targetCAC,
    maxCPL,
    targetCPL,
    steps: [
      step('profitPerClient', [val('clientValue', b.clientValue, 'currency'), val('margin', b.margin, 'percent')], profitPerClient, 'currency'),
      step(
        'leadToClient',
        [
          val('bookingRate', b.bookingRate, 'percent', rateTag, rateSource),
          val('showRate', b.showRate, 'percent', rateTag, rateSource),
          val('closeRate', b.closeRate, 'percent', rateTag, rateSource),
        ],
        leadToClient,
        'percent',
      ),
      step('maxCAC', [val('profitPerClient', profitPerClient, 'currency')], maxCAC, 'currency'),
      step('targetCAC', [val('maxCAC', maxCAC, 'currency'), val('profitBuffer', profitBuffer, 'percent', 'setting')], targetCAC, 'currency'),
      step('maxCPL', [val('maxCAC', maxCAC, 'currency'), val('leadToClient', leadToClient, 'percent')], maxCPL, 'currency'),
      step('targetCPL', [val('targetCAC', targetCAC, 'currency'), val('leadToClient', leadToClient, 'percent')], targetCPL, 'currency'),
    ],
  };
}

/** 9.1 Ecommerce. */
export function ecomLimits(e: EcomBusiness, profitBuffer: number): Stepped<EcomLimits> {
  const fees = e.aov * e.paymentFee;
  const returns = e.aov * e.returnRate;
  const profitPerOrder = e.aov - e.productCost - e.shipping - fees - returns;
  const lifetime = e.judgeOn === 'lifetime' && (e.ordersPerCustomer ?? 1) > 1;
  const orders = lifetime ? (e.ordersPerCustomer ?? 1) : 1;
  const breakEvenCPA = profitPerOrder * orders;
  const breakEvenROAS = div(e.aov, profitPerOrder);
  const targetCPA = breakEvenCPA / (1 + profitBuffer);

  return {
    kind: 'ecommerce',
    profitPerOrder,
    breakEvenCPA,
    breakEvenROAS,
    targetCPA,
    steps: [
      step(
        'profitPerOrder',
        [
          val('aov', e.aov, 'currency'),
          val('productCost', e.productCost, 'currency'),
          val('shipping', e.shipping, 'currency'),
          val('paymentFee', e.paymentFee, 'percent'),
          val('returnRate', e.returnRate, 'percent'),
        ],
        profitPerOrder,
        'currency',
        true,
      ),
      step(
        lifetime ? 'breakEvenCPALifetime' : 'breakEvenCPA',
        [val('profitPerOrder', profitPerOrder, 'currency'), ...(lifetime ? [val('ordersPerCustomer', orders, 'number')] : [])],
        breakEvenCPA,
        'currency',
      ),
      step('breakEvenROAS', [val('aov', e.aov, 'currency'), val('profitPerOrder', profitPerOrder, 'currency')], breakEvenROAS, 'multiplier'),
      step('targetCPA', [val('breakEvenCPA', breakEvenCPA, 'currency'), val('profitBuffer', profitBuffer, 'percent', 'setting')], targetCPA, 'currency'),
    ],
  };
}

/** Max and target cost per platform result (lead or purchase). */
export function resultCostLimits(l: Limits) {
  return l.kind === 'leads' ? { max: l.maxCPL, target: l.targetCPL } : { max: l.breakEvenCPA, target: l.targetCPA };
}

/** Platform results needed for the business target (9.4: leads = clients ÷ leadToClient). */
export function requiredResults(type: BusinessType, target: number, l: Limits) {
  return type === 'leads' && l.kind === 'leads' ? div(target, l.leadToClient) : target;
}
