import React, { useEffect } from 'react';
import { InsightData, CardType } from '../types';

interface TreasureMapReportProps {
    insights: InsightData[];
    clientName: string;
    clientLogo: string | null;
    captainsOrders: string;
    onReset: () => void;
}

const TreasureMapReport: React.FC<TreasureMapReportProps> = ({ insights, clientName, clientLogo, captainsOrders, onReset }) => {
    const roses = insights.filter(i => i.card.type === CardType.ROSE);
    const thorns = insights.filter(i => i.card.type === CardType.THORN);
    const buds = insights.filter(i => i.card.type === CardType.BUD);

    // Find top voted bud
    const topBud = buds.reduce((prev, current) => {
        return (prev && prev.votes.up > current.votes.up) ? prev : current;
    }, null as InsightData | null);

    const currentDate = new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const downloadPDF = () => {
        const originalTitle = document.title;
        const safeClientName = (clientName || "Client").replace(/[^a-z0-9]/gi, '_');
        const dateStr = new Date().toISOString().split('T')[0];
        document.title = `Treasure_Map_Insights_${safeClientName}_${dateStr}`;
        window.print();
        document.title = originalTitle;
    };

    // Helper for footer
    const Footer = () => (
        <div className="mt-auto pt-8 border-t border-gold/30 text-center opacity-60 text-xs font-serif text-wood-dark print:fixed print:bottom-4 print:left-0 print:right-0 print:opacity-100">
            <p>Compiled aboard the S.S. Insight • Powered by Maritime Quest • maritimequest.io</p>
        </div>
    );

    return (
        <div className="min-h-screen ocean-bg flex flex-col items-center justify-center p-8 relative overflow-hidden print:p-0 print:overflow-visible">

            {/* Actions (Hidden in Print) */}
            <div className="fixed top-4 right-4 z-50 flex gap-4 print:hidden">
                <button onClick={onReset} className="px-6 py-2 bg-wood text-parchment rounded font-bold hover:bg-wood-light shadow-lg">
                    New Voyage
                </button>
                <button onClick={downloadPDF} className="px-6 py-2 bg-gold text-wood-dark rounded font-bold hover:bg-yellow-400 shadow-lg flex items-center gap-2">
                    <i className="fa-solid fa-file-arrow-down"></i> Download Treasure Map
                </button>
            </div>

            <div id="printable-map" className="max-w-5xl w-full bg-parchment-aged shadow-high-contrast relative z-10 print:shadow-none print:w-full print:max-w-none">

                {/* --- PAGE 1: COVER --- */}
                <div className="min-h-[1100px] p-16 flex flex-col items-center justify-center text-center relative border-filigree break-after-page print:min-h-screen print:border-none">
                    {/* Corner Ornaments */}
                    <div className="absolute top-8 left-8 text-6xl text-gold opacity-80">⚜️</div>
                    <div className="absolute top-8 right-8 text-6xl text-gold opacity-80">⚜️</div>
                    <div className="absolute bottom-8 left-8 text-6xl text-gold opacity-80">⚜️</div>
                    <div className="absolute bottom-8 right-8 text-6xl text-gold opacity-80">⚜️</div>

                    {/* Compass Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <i className="fa-regular fa-compass text-[400px] text-wood-dark"></i>
                    </div>

                    <div className="relative z-10 space-y-12">
                        <h1 className="text-7xl font-pirate text-wood-dark text-glow-gold leading-tight">
                            Treasure Map<br />of Insights
                        </h1>

                        <div className="w-32 h-1 bg-gold mx-auto"></div>

                        <h2 className="text-4xl font-cinzel text-wood-light">S.S. Insight</h2>

                        {clientLogo && (
                            <div className="my-12">
                                <img src={clientLogo} alt="Client Logo" className="max-h-48 mx-auto drop-shadow-md" />
                            </div>
                        )}

                        <div className="mt-16 font-crimson text-xl text-wood-dark italic">
                            <p>Compiled this {currentDate}</p>
                            <p className="font-bold mt-2 uppercase tracking-widest">{clientName || "The High Seas"}</p>
                        </div>
                    </div>

                    <div className="absolute bottom-16 left-0 right-0">
                        <Footer />
                    </div>
                </div>

                {/* --- PAGE 2: EXECUTIVE OVERVIEW --- */}
                <div className="min-h-[1100px] p-16 relative border-filigree break-after-page print:min-h-screen print:border-none">
                    <h2 className="text-5xl font-pirate text-center text-wood-dark mb-16 border-b-2 border-gold pb-4">Executive Overview</h2>

                    <div className="grid grid-cols-1 gap-16">
                        {/* Victories Summary */}
                        <div className="flex items-start gap-6">
                            <div className="text-6xl bg-emerald-100 p-6 rounded-full border-2 border-emerald-600 shadow-sm">🌹</div>
                            <div>
                                <h3 className="text-3xl font-cinzel text-emerald-900 mb-2">Smooth Seas</h3>
                                <p className="font-crimson text-2xl text-wood-dark italic">
                                    "{roses[0]?.card.content || "The crew sailed with high spirits."}"
                                </p>
                            </div>
                        </div>

                        {/* Challenges Summary */}
                        <div className="flex items-start gap-6">
                            <div className="text-6xl bg-rose-100 p-6 rounded-full border-2 border-rose-600 shadow-sm">⚔️</div>
                            <div>
                                <h3 className="text-3xl font-cinzel text-rose-900 mb-2">Krakens Defeated</h3>
                                <p className="font-crimson text-2xl text-wood-dark italic">
                                    "{thorns[0]?.card.content || "No major beasts encountered."}"
                                </p>
                            </div>
                        </div>

                        {/* Ideas Summary */}
                        <div className="flex items-start gap-6">
                            <div className="text-6xl bg-amber-100 p-6 rounded-full border-2 border-amber-600 shadow-sm">💎</div>
                            <div>
                                <h3 className="text-3xl font-cinzel text-amber-900 mb-2">Buried Treasure</h3>
                                <p className="font-crimson text-2xl text-wood-dark italic">
                                    "{topBud?.userInput || topBud?.card.content || "Gold awaits those who seek it."}"
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-16 left-0 right-0">
                        <Footer />
                    </div>
                </div>

                {/* --- PAGE 3: DETAILED INSIGHTS --- */}
                <div className="min-h-[1100px] p-16 relative border-filigree print:min-h-screen print:border-none">

                    {/* ROSES */}
                    {roses.length > 0 && (
                        <section className="mb-12 break-inside-avoid">
                            <h3 className="text-4xl font-pirate text-emerald-800 mb-6 border-b border-emerald-800/30 pb-2">
                                🌹 Smooth Seas (Victories)
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {roses.map((rose, idx) => (
                                    <li key={idx} className="flex items-start gap-3 font-crimson text-xl text-wood-dark">
                                        <span className="text-emerald-600 mt-1">❧</span>
                                        <span>"{rose.card.content}"</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* THORNS */}
                    {thorns.length > 0 && (
                        <section className="mb-12 break-inside-avoid">
                            <h3 className="text-4xl font-pirate text-rose-900 mb-6 border-b border-rose-900/30 pb-2">
                                ⚔️ Krakens Defeated
                            </h3>
                            <div className="space-y-6">
                                {thorns.map((thorn, idx) => (
                                    <div key={idx} className="bg-rose-50/30 p-4 rounded border-l-4 border-rose-800 break-inside-avoid">
                                        <p className="font-cinzel text-lg text-burgundy font-bold mb-2">"{thorn.card.content}"</p>
                                        <div className="pl-4 border-l border-rose-300 ml-1">
                                            <p className="font-crimson text-xl text-black">
                                                {thorn.submitter && <span className="font-bold text-sm uppercase tracking-wider text-gray-600 mr-2">{thorn.submitter}:</span>}
                                                {thorn.userInput || <span className="italic text-gray-500">Crew to assign owner in follow-up meeting</span>}
                                            </p>
                                            {thorn.userInput && (
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-gold font-bold text-sm">
                                                        {thorn.votes.up}/{thorn.votes.up + thorn.votes.down} crews approve
                                                    </span>
                                                    {/* Simulated assignment logic */}
                                                    <span className="text-xs bg-gold/20 text-wood-dark px-2 py-1 rounded border border-gold/50">
                                                        Action Assigned to: {thorn.submitter || "Volunteer"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* BUDS */}
                    {buds.length > 0 && (
                        <section className="mb-12 break-inside-avoid">
                            <h3 className="text-4xl font-pirate text-amber-800 mb-6 border-b border-amber-800/30 pb-2">
                                💎 Buried Treasure
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                {buds.map((bud, idx) => {
                                    const isTop = topBud === bud && bud.votes.up > 0;
                                    return (
                                        <div key={idx} className={`relative p-6 border-2 break-inside-avoid ${isTop ? 'bg-amber-50 border-gold shadow-md' : 'border-transparent border-b-wood-light/20'}`}>
                                            {isTop && (
                                                <div className="absolute -top-3 -right-3 bg-gold text-wood-dark font-bold px-4 py-1 rounded-full shadow border border-wood text-xs uppercase tracking-wider flex items-center gap-2 z-10">
                                                    <i className="fa-solid fa-compass"></i> Captain's Favorite
                                                </div>
                                            )}
                                            <p className={`font-crimson text-2xl ${isTop ? 'text-amber-900 font-bold' : 'text-wood-dark'}`}>
                                                "{bud.userInput || bud.card.content}"
                                            </p>
                                            <div className="flex items-center gap-1 mt-2">
                                                {Array.from({ length: bud.votes.up }).map((_, i) => (
                                                    <span key={i} className="text-lg">🔥</span>
                                                ))}
                                                <span className="text-xs text-gray-400 ml-2">({bud.votes.up})</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* CAPTAIN'S ORDERS */}
                    <section className="mt-16 p-8 bg-wood-dark text-parchment rounded-lg relative break-inside-avoid print:bg-transparent print:text-black print:border-4 print:border-wood-dark">
                        <h3 className="text-3xl font-pirate text-gold mb-4 text-center">Captain's Orders</h3>
                        <p className="font-crimson text-xl italic leading-relaxed text-center">
                            "{captainsOrders || "The winds are favorable. Take these insights and chart a course for success! The S.S. Insight awaits your return."}"
                        </p>
                        <div className="text-center mt-4 font-pirate text-2xl text-gold opacity-80">- Captain Morgana</div>
                    </section>

                    <div className="mt-16">
                        <Footer />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TreasureMapReport;
