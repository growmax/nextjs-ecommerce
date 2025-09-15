import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";

export default function OrdersLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-sans">
              Orders Landing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base font-sans">
              Welcome to the Orders Landing page. This page uses your custom
              TweakCN theme with ABeeZee font.
            </p>
            <div className="space-y-2">
              <p
                className="text-sm font-sans text-muted-foreground debug-font"
                data-font="ABeeZee"
              >
                Font Test: This text should appear in ABeeZee font family.
              </p>
              <p
                className="text-sm font-serif debug-font"
                data-font="Alegreya SC"
              >
                Serif Test: This text should appear in Alegreya SC font family.
              </p>
              <code
                className="text-sm font-mono bg-muted px-2 py-1 rounded debug-font"
                data-font="JetBrains Mono"
              >
                Mono Test: This text should appear in JetBrains Mono font
                family.
              </code>
            </div>

            {/* Font Loading Debug Info */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs">
              <h4 className="font-semibold mb-2">Font Debug Info:</h4>
              <p>
                Expected Sans: var(--font-abeezee), ui-sans-serif, sans-serif
              </p>
              <p>Expected Serif: var(--font-alegreya-sc), serif</p>
              <p>Expected Mono: var(--font-jetbrains-mono), monospace</p>
              <p className="mt-2 text-muted-foreground">
                Refresh this page and check browser DevTools → Network tab to
                confirm fonts are loading.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
