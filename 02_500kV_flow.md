\<\!DOCTYPE html\>  
\<html lang="vi"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>500kV Power Flow Visualization\</title\>  
    \<style\>  
        body {  
            margin: 0;  
            padding: 20px;  
            background: \#f5f5f5;  
            font-family: \-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;  
            display: flex;  
            justify-content: center;  
            align-items: center;  
            min-height: 100vh;  
        }

        .container {  
            width: 100%;  
            max-width: 1400px;  
            height: 800px;  
            position: relative;  
            background: white;  
            border-radius: 10px;  
            padding: 40px;  
            box-sizing: border-box;  
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);  
        }

        .title {  
            position: absolute;  
            top: 20px;  
            left: 50%;  
            transform: translateX(-50%);  
            color: \#333;  
            font-size: 24px;  
            font-weight: bold;  
            text-align: center;  
        }

        /\* 500kV Bus Lines \*/  
        .bus-line {  
            position: absolute;  
            height: 4px;  
            background: \#e74c3c;  
            box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);  
        }

        /\* Bus positions \*/  
        .bus-1 { width: 85%; top: 100px; left: 7.5%; }  
        .bus-2 { width: 85%; top: 150px; left: 7.5%; }  
        .bus-3 { width: 85%; top: 200px; left: 7.5%; }  
        .bus-4 { width: 85%; top: 250px; left: 7.5%; }

        /\* Animated dots \*/  
        .power-dot {  
            position: absolute;  
            width: 10px;  
            height: 10px;  
            background: white;  
            border: 2px solid \#e74c3c;  
            border-radius: 50%;  
            top: \-3px;  
        }

        /\* Substations \*/  
        .substation-group {  
            position: absolute;  
            display: flex;  
            flex-direction: column;  
            align-items: center;  
            gap: 20px;  
        }

        .substation {  
            width: 180px;  
            height: 120px;  
            background: \#f8f9fa;  
            border: 2px solid \#2c3e50;  
            border-radius: 8px;  
            display: flex;  
            flex-direction: column;  
            align-items: center;  
            justify-content: center;  
            position: relative;  
        }

        .substation-title {  
            font-size: 13px;  
            font-weight: 600;  
            color: \#2c3e50;  
            margin-bottom: 8px;  
            letter-spacing: 0.5px;  
            text-transform: uppercase;  
        }

        .substation-voltage {  
            font-size: 22px;  
            font-weight: 700;  
            color: \#e74c3c;  
            letter-spacing: \-0.5px;  
        }

        .substation-capacity {  
            font-size: 11px;  
            color: \#7f8c8d;  
            margin-top: 5px;  
            font-weight: 400;  
        }

        \#sub-group-1 {  
            top: 350px;  
            left: 240px;  
            transform: translateX(-50%);  
        }

        \#sub-group-2 {  
            top: 350px;  
            right: 240px;  
            transform: translateX(50%);  
        }

        /\* Connection points \- Fixed positions \*/  
        .connection-point {  
            position: absolute;  
            width: 12px;  
            height: 12px;  
            background: \#e74c3c;  
            border: 2px solid white;  
            border-radius: 50%;  
            z-index: 10;  
        }

        .connection-left {  
            left: 240px;  
            top: 175px;  
            transform: translateX(-50%);  
        }

        .connection-right {  
            right: 240px;  
            top: 175px;  
            transform: translateX(50%);  
        }

        /\* Vertical connections \- Fixed alignment \*/  
        .vertical-line {  
            position: absolute;  
            width: 2px;  
            background: \#e74c3c;  
            height: 175px;  
        }

        .vert-1 {   
            left: 240px;   
            top: 175px;   
            transform: translateX(-50%);  
        }  
          
        .vert-2 {   
            right: 240px;   
            top: 175px;   
            transform: translateX(50%);  
        }

        /\* 220kV Distribution line \*/  
        .distribution-220 {  
            position: absolute;  
            width: 60%;  
            height: 3px;  
            background: \#3498db;  
            bottom: 280px;  
            left: 20%;  
        }

        /\* Data Centers \*/  
        .datacenter-container {  
            position: absolute;  
            bottom: 60px;  
            left: 50%;  
            transform: translateX(-50%);  
            display: flex;  
            gap: 50px;  
        }

        .datacenter {  
            width: 180px;  
            height: 100px;  
            background: \#ecf0f1;  
            border: 2px solid \#3498db;  
            border-radius: 8px;  
            display: flex;  
            flex-direction: column;  
            align-items: center;  
            justify-content: center;  
        }

        .datacenter-name {  
            font-size: 13px;  
            color: \#2c3e50;  
            margin-bottom: 8px;  
            font-weight: 600;  
            letter-spacing: 0.5px;  
            text-transform: uppercase;  
        }

        .datacenter-power {  
            font-size: 28px;  
            font-weight: 700;  
            color: \#27ae60;  
            letter-spacing: \-1px;  
        }

        .datacenter-voltage {  
            font-size: 11px;  
            color: \#7f8c8d;  
            margin-top: 5px;  
            font-weight: 400;  
        }

        /\* Vertical drops to data centers \*/  
        .drop-line {  
            position: absolute;  
            width: 2px;  
            height: 80px;  
            background: \#3498db;  
            bottom: 160px;  
        }

        .drop-1 { left: 365px; }  
        .drop-2 { left: 50%; transform: translateX(-50%); }  
        .drop-3 { right: 365px; }

        /\* Labels \*/  
        .voltage-label {  
            position: absolute;  
            background: \#e74c3c;  
            color: white;  
            padding: 6px 16px;  
            border-radius: 4px;  
            font-size: 16.5px;  
            font-weight: 600;  
            letter-spacing: 0.5px;  
            text-transform: uppercase;  
        }

        /\* Flow particles \*/  
        .flow-particle {  
            position: absolute;  
            width: 4px;  
            height: 12px;  
            background: \#3498db;  
            border-radius: 2px;  
            opacity: 0.8;  
        }

        /\* Animations \*/  
        @keyframes moveDot {  
            0% { left: \-20px; }  
            100% { left: calc(100% \+ 20px); }  
        }

        @keyframes flowDown {  
            0% { top: \-20px; opacity: 0; }  
            10% { opacity: 0.8; }  
            90% { opacity: 0.8; }  
            100% { top: 100%; opacity: 0; }  
        }

        /\* Output indicators \*/  
        .output-220 {  
            position: absolute;  
            bottom: \-25px;  
            left: 50%;  
            transform: translateX(-50%);  
            background: \#3498db;  
            color: white;  
            padding: 3px 12px;  
            border-radius: 4px;  
            font-size: 10px;  
            font-weight: 600;  
            letter-spacing: 0.5px;  
        }  
    \</style\>  
\</head\>  
\<body\>  
    \<div class="container"\>  
        \<\!-- Title removed \--\>

        \<\!-- 500kV Bus Lines \--\>  
        \<div class="bus-line bus-1"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 2s;"\>\</div\>  
        \</div\>  
        \<div class="bus-line bus-2"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 0.5s;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 2.5s;"\>\</div\>  
        \</div\>  
        \<div class="bus-line bus-3"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 1s;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 3s;"\>\</div\>  
        \</div\>  
        \<div class="bus-line bus-4"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 1.5s;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 3.5s;"\>\</div\>  
        \</div\>

        \<\!-- Voltage Labels \--\>  
        \<div class="voltage-label" style="top: 88px; left: 20px;"\>500kV LINE 01\</div\>  
        \<div class="voltage-label" style="top: 138px; left: 20px;"\>500kV LINE 02\</div\>  
        \<div class="voltage-label" style="top: 188px; left: 20px;"\>500kV LINE 03\</div\>  
        \<div class="voltage-label" style="top: 238px; left: 20px;"\>500kV LINE 04\</div\>

        \<\!-- Connection Points \- Fixed position \--\>  
        \<div class="connection-point connection-left"\>\</div\>  
        \<div class="connection-point connection-right"\>\</div\>

        \<\!-- Vertical Lines \- Aligned with connection points \--\>  
        \<div class="vertical-line vert-1"\>\</div\>  
        \<div class="vertical-line vert-2"\>\</div\>

        \<\!-- Substation Groups \--\>  
        \<div class="substation-group" id="sub-group-1"\>  
            \<div class="substation"\>  
                \<div class="substation-title"\>SUBSTATION 01\</div\>  
                \<div class="substation-voltage"\>500/220kV\</div\>  
                \<div class="substation-capacity"\>2 x 600MVA\</div\>  
                \<div class="output-220"\>220kV OUT\</div\>  
            \</div\>  
        \</div\>

        \<div class="substation-group" id="sub-group-2"\>  
            \<div class="substation"\>  
                \<div class="substation-title"\>SUBSTATION 02\</div\>  
                \<div class="substation-voltage"\>500/220kV\</div\>  
                \<div class="substation-capacity"\>2 x 600MVA\</div\>  
                \<div class="output-220"\>220kV OUT\</div\>  
            \</div\>  
        \</div\>

        \<\!-- 220kV Distribution \--\>  
        \<div class="distribution-220"\>\</div\>

        \<\!-- Vertical drops \--\>  
        \<div class="drop-line drop-1"\>  
            \<div class="flow-particle" style="animation: flowDown 2s linear infinite;"\>\</div\>  
        \</div\>  
        \<div class="drop-line drop-2"\>  
            \<div class="flow-particle" style="animation: flowDown 2s linear infinite 0.7s;"\>\</div\>  
        \</div\>  
        \<div class="drop-line drop-3"\>  
            \<div class="flow-particle" style="animation: flowDown 2s linear infinite 1.4s;"\>\</div\>  
        \</div\>

        \<\!-- Data Centers \--\>  
        \<div class="datacenter-container"\>  
            \<div class="datacenter"\>  
                \<div class="datacenter-name"\>DATA CENTER 01\</div\>  
                \<div class="datacenter-power"\>100MW\</div\>  
                \<div class="datacenter-voltage"\>22kV\</div\>  
            \</div\>  
            \<div class="datacenter"\>  
                \<div class="datacenter-name"\>DATA CENTER 02\</div\>  
                \<div class="datacenter-power"\>100MW\</div\>  
                \<div class="datacenter-voltage"\>22kV\</div\>  
            \</div\>  
            \<div class="datacenter"\>  
                \<div class="datacenter-name"\>DATA CENTER 03\</div\>  
                \<div class="datacenter-power"\>100MW\</div\>  
                \<div class="datacenter-voltage"\>22kV\</div\>  
            \</div\>  
        \</div\>  
    \</div\>

    \<script\>  
        // Animate power values  
        setInterval(() \=\> {  
            const powers \= document.querySelectorAll('.datacenter-power');  
            powers.forEach(power \=\> {  
                const base \= 100;  
                const variation \= Math.floor(Math.random() \* 3 \- 1);  
                power.textContent \= (base \+ variation) \+ 'MW';  
            });  
        }, 3000);

        // Connection point pulse  
        const connPoints \= document.querySelectorAll('.connection-point');  
        setInterval(() \=\> {  
            connPoints.forEach(point \=\> {  
                point.style.transform \= point.classList.contains('connection-left') ?   
                    'translateX(-50%) scale(1.2)' : 'translateX(50%) scale(1.2)';  
                setTimeout(() \=\> {  
                    point.style.transform \= point.classList.contains('connection-left') ?   
                        'translateX(-50%) scale(1)' : 'translateX(50%) scale(1)';  
                }, 500);  
            });  
        }, 2000);  
    \</script\>  
\</body\>  
\</html\>  
\<\!DOCTYPE html\>  
\<html lang="vi"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>500kV Power Flow Visualization\</title\>  
    \<style\>  
        body {  
            margin: 0;  
            padding: 20px;  
            background: \#f5f5f5;  
            font-family: \-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;  
            display: flex;  
            justify-content: center;  
            align-items: center;  
            min-height: 100vh;  
        }

        .container {  
            width: 100%;  
            max-width: 1400px;  
            height: 800px;  
            position: relative;  
            background: white;  
            border-radius: 10px;  
            padding: 40px;  
            box-sizing: border-box;  
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);  
        }

        .title {  
            position: absolute;  
            top: 20px;  
            left: 50%;  
            transform: translateX(-50%);  
            color: \#333;  
            font-size: 24px;  
            font-weight: bold;  
            text-align: center;  
        }

        /\* 500kV Bus Lines \*/  
        .bus-line {  
            position: absolute;  
            height: 4px;  
            background: \#e74c3c;  
            box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);  
        }

        /\* Bus positions \*/  
        .bus-1 { width: 85%; top: 100px; left: 7.5%; }  
        .bus-2 { width: 85%; top: 150px; left: 7.5%; }  
        .bus-3 { width: 85%; top: 200px; left: 7.5%; }  
        .bus-4 { width: 85%; top: 250px; left: 7.5%; }

        /\* Animated dots \*/  
        .power-dot {  
            position: absolute;  
            width: 10px;  
            height: 10px;  
            background: white;  
            border: 2px solid \#e74c3c;  
            border-radius: 50%;  
            top: \-3px;  
        }

        /\* Substations \*/  
        .substation-group {  
            position: absolute;  
            display: flex;  
            flex-direction: column;  
            align-items: center;  
            gap: 20px;  
        }

        .substation {  
            width: 180px;  
            height: 120px;  
            background: \#f8f9fa;  
            border: 2px solid \#2c3e50;  
            border-radius: 8px;  
            display: flex;  
            flex-direction: column;  
            align-items: center;  
            justify-content: center;  
            position: relative;  
        }

        .substation-title {  
            font-size: 13px;  
            font-weight: 600;  
            color: \#2c3e50;  
            margin-bottom: 8px;  
            letter-spacing: 0.5px;  
            text-transform: uppercase;  
        }

        .substation-voltage {  
            font-size: 22px;  
            font-weight: 700;  
            color: \#e74c3c;  
            letter-spacing: \-0.5px;  
        }

        .substation-capacity {  
            font-size: 11px;  
            color: \#7f8c8d;  
            margin-top: 5px;  
            font-weight: 400;  
        }

        \#sub-group-1 {  
            top: 350px;  
            left: 240px;  
            transform: translateX(-50%);  
        }

        \#sub-group-2 {  
            top: 350px;  
            right: 240px;  
            transform: translateX(50%);  
        }

        /\* Connection points \- Fixed positions \*/  
        .connection-point {  
            position: absolute;  
            width: 12px;  
            height: 12px;  
            background: \#e74c3c;  
            border: 2px solid white;  
            border-radius: 50%;  
            z-index: 10;  
        }

        .connection-left {  
            left: 240px;  
            top: 175px;  
            transform: translateX(-50%);  
        }

        .connection-right {  
            right: 240px;  
            top: 175px;  
            transform: translateX(50%);  
        }

        /\* Vertical connections \- Fixed alignment \*/  
        .vertical-line {  
            position: absolute;  
            width: 2px;  
            background: \#e74c3c;  
            height: 175px;  
        }

        .vert-1 {   
            left: 240px;   
            top: 175px;   
            transform: translateX(-50%);  
        }  
          
        .vert-2 {   
            right: 240px;   
            top: 175px;   
            transform: translateX(50%);  
        }

        /\* 220kV Distribution line \*/  
        .distribution-220 {  
            position: absolute;  
            width: 60%;  
            height: 3px;  
            background: \#3498db;  
            bottom: 280px;  
            left: 20%;  
        }

        /\* Data Centers \*/  
        .datacenter-container {  
            position: absolute;  
            bottom: 60px;  
            left: 50%;  
            transform: translateX(-50%);  
            display: flex;  
            gap: 50px;  
        }

        .datacenter {  
            width: 180px;  
            height: 100px;  
            background: \#ecf0f1;  
            border: 2px solid \#3498db;  
            border-radius: 8px;  
            display: flex;  
            flex-direction: column;  
            align-items: center;  
            justify-content: center;  
        }

        .datacenter-name {  
            font-size: 13px;  
            color: \#2c3e50;  
            margin-bottom: 8px;  
            font-weight: 600;  
            letter-spacing: 0.5px;  
            text-transform: uppercase;  
        }

        .datacenter-power {  
            font-size: 28px;  
            font-weight: 700;  
            color: \#27ae60;  
            letter-spacing: \-1px;  
        }

        .datacenter-voltage {  
            font-size: 11px;  
            color: \#7f8c8d;  
            margin-top: 5px;  
            font-weight: 400;  
        }

        /\* Vertical drops to data centers \*/  
        .drop-line {  
            position: absolute;  
            width: 2px;  
            height: 80px;  
            background: \#3498db;  
            bottom: 160px;  
        }

        .drop-1 { left: 365px; }  
        .drop-2 { left: 50%; transform: translateX(-50%); }  
        .drop-3 { right: 365px; }

        /\* Labels \*/  
        .voltage-label {  
            position: absolute;  
            background: \#e74c3c;  
            color: white;  
            padding: 6px 16px;  
            border-radius: 4px;  
            font-size: 16.5px;  
            font-weight: 600;  
            letter-spacing: 0.5px;  
            text-transform: uppercase;  
        }

        /\* Flow particles \*/  
        .flow-particle {  
            position: absolute;  
            width: 4px;  
            height: 12px;  
            background: \#3498db;  
            border-radius: 2px;  
            opacity: 0.8;  
        }

        /\* Animations \*/  
        @keyframes moveDot {  
            0% { left: \-20px; }  
            100% { left: calc(100% \+ 20px); }  
        }

        @keyframes flowDown {  
            0% { top: \-20px; opacity: 0; }  
            10% { opacity: 0.8; }  
            90% { opacity: 0.8; }  
            100% { top: 100%; opacity: 0; }  
        }

        /\* Output indicators \*/  
        .output-220 {  
            position: absolute;  
            bottom: \-25px;  
            left: 50%;  
            transform: translateX(-50%);  
            background: \#3498db;  
            color: white;  
            padding: 3px 12px;  
            border-radius: 4px;  
            font-size: 10px;  
            font-weight: 600;  
            letter-spacing: 0.5px;  
        }  
    \</style\>  
\</head\>  
\<body\>  
    \<div class="container"\>  
        \<\!-- Title removed \--\>

        \<\!-- 500kV Bus Lines \--\>  
        \<div class="bus-line bus-1"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 2s;"\>\</div\>  
        \</div\>  
        \<div class="bus-line bus-2"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 0.5s;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 2.5s;"\>\</div\>  
        \</div\>  
        \<div class="bus-line bus-3"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 1s;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 3s;"\>\</div\>  
        \</div\>  
        \<div class="bus-line bus-4"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 1.5s;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 3.5s;"\>\</div\>  
        \</div\>

        \<\!-- Voltage Labels \--\>  
        \<div class="voltage-label" style="top: 88px; left: 20px;"\>500kV LINE 01\</div\>  
        \<div class="voltage-label" style="top: 138px; left: 20px;"\>500kV LINE 02\</div\>  
        \<div class="voltage-label" style="top: 188px; left: 20px;"\>500kV LINE 03\</div\>  
        \<div class="voltage-label" style="top: 238px; left: 20px;"\>500kV LINE 04\</div\>

        \<\!-- Connection Points \- Fixed position \--\>  
        \<div class="connection-point connection-left"\>\</div\>  
        \<div class="connection-point connection-right"\>\</div\>

        \<\!-- Vertical Lines \- Aligned with connection points \--\>  
        \<div class="vertical-line vert-1"\>\</div\>  
        \<div class="vertical-line vert-2"\>\</div\>

        \<\!-- Substation Groups \--\>  
        \<div class="substation-group" id="sub-group-1"\>  
            \<div class="substation"\>  
                \<div class="substation-title"\>SUBSTATION 01\</div\>  
                \<div class="substation-voltage"\>500/220kV\</div\>  
                \<div class="substation-capacity"\>2 x 600MVA\</div\>  
                \<div class="output-220"\>220kV OUT\</div\>  
            \</div\>  
        \</div\>

        \<div class="substation-group" id="sub-group-2"\>  
            \<div class="substation"\>  
                \<div class="substation-title"\>SUBSTATION 02\</div\>  
                \<div class="substation-voltage"\>500/220kV\</div\>  
                \<div class="substation-capacity"\>2 x 600MVA\</div\>  
                \<div class="output-220"\>220kV OUT\</div\>  
            \</div\>  
        \</div\>

        \<\!-- 220kV Distribution \--\>  
        \<div class="distribution-220"\>\</div\>

        \<\!-- Vertical drops \--\>  
        \<div class="drop-line drop-1"\>  
            \<div class="flow-particle" style="animation: flowDown 2s linear infinite;"\>\</div\>  
        \</div\>  
        \<div class="drop-line drop-2"\>  
            \<div class="flow-particle" style="animation: flowDown 2s linear infinite 0.7s;"\>\</div\>  
        \</div\>  
        \<div class="drop-line drop-3"\>  
            \<div class="flow-particle" style="animation: flowDown 2s linear infinite 1.4s;"\>\</div\>  
        \</div\>

        \<\!-- Data Centers \--\>  
        \<div class="datacenter-container"\>  
            \<div class="datacenter"\>  
                \<div class="datacenter-name"\>DATA CENTER 01\</div\>  
                \<div class="datacenter-power"\>100MW\</div\>  
                \<div class="datacenter-voltage"\>22kV\</div\>  
            \</div\>  
            \<div class="datacenter"\>  
                \<div class="datacenter-name"\>DATA CENTER 02\</div\>  
                \<div class="datacenter-power"\>100MW\</div\>  
                \<div class="datacenter-voltage"\>22kV\</div\>  
            \</div\>  
            \<div class="datacenter"\>  
                \<div class="datacenter-name"\>DATA CENTER 03\</div\>  
                \<div class="datacenter-power"\>100MW\</div\>  
                \<div class="datacenter-voltage"\>22kV\</div\>  
            \</div\>  
        \</div\>  
    \</div\>

    \<script\>  
        // Animate power values  
        setInterval(() \=\> {  
            const powers \= document.querySelectorAll('.datacenter-power');  
            powers.forEach(power \=\> {  
                const base \= 100;  
                const variation \= Math.floor(Math.random() \* 3 \- 1);  
                power.textContent \= (base \+ variation) \+ 'MW';  
            });  
        }, 3000);

        // Connection point pulse  
        const connPoints \= document.querySelectorAll('.connection-point');  
        setInterval(() \=\> {  
            connPoints.forEach(poin\<\!DOCTYPE html\>  
\<html lang="vi"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>500kV Power Flow Visualization\</title\>  
    \<style\>  
        body {  
            margin: 0;  
            padding: 20px;  
            background: \#f5f5f5;  
            font-family: \-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;  
            display: flex;  
            justify-content: center;  
            align-items: center;  
            min-height: 100vh;  
        }

        .container {  
            width: 100%;  
            max-width: 1400px;  
            height: 800px;  
            position: relative;  
            background: white;  
            border-radius: 10px;  
            padding: 40px;  
            box-sizing: border-box;  
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);  
        }

        .title {  
            position: absolute;  
            top: 20px;  
            left: 50%;  
            transform: translateX(-50%);  
            color: \#333;  
            font-size: 24px;  
            font-weight: bold;  
            text-align: center;  
        }

        /\* 500kV Bus Lines \*/  
        .bus-line {  
            position: absolute;  
            height: 4px;  
            background: \#e74c3c;  
            box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);  
        }

        /\* Bus positions \*/  
        .bus-1 { width: 85%; top: 100px; left: 7.5%; }  
        .bus-2 { width: 85%; top: 150px; left: 7.5%; }  
        .bus-3 { width: 85%; top: 200px; left: 7.5%; }  
        .bus-4 { width: 85%; top: 250px; left: 7.5%; }

        /\* Animated dots \*/  
        .power-dot {  
            position: absolute;  
            width: 10px;  
            height: 10px;  
            background: white;  
            border: 2px solid \#e74c3c;  
            border-radius: 50%;  
            top: \-3px;  
        }

        /\* Substations \*/  
        .substation-group {  
            position: absolute;  
            display: flex;  
            flex-direction: column;  
            align-items: center;  
            gap: 20px;  
        }

        .substation {  
            width: 180px;  
            height: 120px;  
            background: \#f8f9fa;  
            border: 2px solid \#2c3e50;  
            border-radius: 8px;  
            display: flex;  
            flex-direction: column;  
            align-items: center;  
            justify-content: center;  
            position: relative;  
        }

        .substation-title {  
            font-size: 13px;  
            font-weight: 600;  
            color: \#2c3e50;  
            margin-bottom: 8px;  
            letter-spacing: 0.5px;  
            text-transform: uppercase;  
        }

        .substation-voltage {  
            font-size: 22px;  
            font-weight: 700;  
            color: \#e74c3c;  
            letter-spacing: \-0.5px;  
        }

        .substation-capacity {  
            font-size: 11px;  
            color: \#7f8c8d;  
            margin-top: 5px;  
            font-weight: 400;  
        }

        \#sub-group-1 {  
            top: 350px;  
            left: 240px;  
            transform: translateX(-50%);  
        }

        \#sub-group-2 {  
            top: 350px;  
            right: 240px;  
            transform: translateX(50%);  
        }

        /\* Connection points \- Fixed positions \*/  
        .connection-point {  
            position: absolute;  
            width: 12px;  
            height: 12px;  
            background: \#e74c3c;  
            border: 2px solid white;  
            border-radius: 50%;  
            z-index: 10;  
        }

        .connection-left {  
            left: 240px;  
            top: 175px;  
            transform: translateX(-50%);  
        }

        .connection-right {  
            right: 240px;  
            top: 175px;  
            transform: translateX(50%);  
        }

        /\* Vertical connections \- Fixed alignment \*/  
        .vertical-line {  
            position: absolute;  
            width: 2px;  
            background: \#e74c3c;  
            height: 175px;  
        }

        .vert-1 {   
            left: 240px;   
            top: 175px;   
            transform: translateX(-50%);  
        }  
          
        .vert-2 {   
            right: 240px;   
            top: 175px;   
            transform: translateX(50%);  
        }

        /\* 220kV Distribution line \*/  
        .distribution-220 {  
            position: absolute;  
            width: 60%;  
            height: 3px;  
            background: \#3498db;  
            bottom: 280px;  
            left: 20%;  
        }

        /\* Data Centers \*/  
        .datacenter-container {  
            position: absolute;  
            bottom: 60px;  
            left: 50%;  
            transform: translateX(-50%);  
            display: flex;  
            gap: 50px;  
        }

        .datacenter {  
            width: 180px;  
            height: 100px;  
            background: \#ecf0f1;  
            border: 2px solid \#3498db;  
            border-radius: 8px;  
            display: flex;  
            flex-direction: column;  
            align-items: center;  
            justify-content: center;  
        }

        .datacenter-name {  
            font-size: 13px;  
            color: \#2c3e50;  
            margin-bottom: 8px;  
            font-weight: 600;  
            letter-spacing: 0.5px;  
            text-transform: uppercase;  
        }

        .datacenter-power {  
            font-size: 28px;  
            font-weight: 700;  
            color: \#27ae60;  
            letter-spacing: \-1px;  
        }

        .datacenter-voltage {  
            font-size: 11px;  
            color: \#7f8c8d;  
            margin-top: 5px;  
            font-weight: 400;  
        }

        /\* Vertical drops to data centers \*/  
        .drop-line {  
            position: absolute;  
            width: 2px;  
            height: 80px;  
            background: \#3498db;  
            bottom: 160px;  
        }

        .drop-1 { left: 365px; }  
        .drop-2 { left: 50%; transform: translateX(-50%); }  
        .drop-3 { right: 365px; }

        /\* Labels \*/  
        .voltage-label {  
            position: absolute;  
            background: \#e74c3c;  
            color: white;  
            padding: 6px 16px;  
            border-radius: 4px;  
            font-size: 16.5px;  
            font-weight: 600;  
            letter-spacing: 0.5px;  
            text-transform: uppercase;  
        }

        /\* Flow particles \*/  
        .flow-particle {  
            position: absolute;  
            width: 4px;  
            height: 12px;  
            background: \#3498db;  
            border-radius: 2px;  
            opacity: 0.8;  
        }

        /\* Animations \*/  
        @keyframes moveDot {  
            0% { left: \-20px; }  
            100% { left: calc(100% \+ 20px); }  
        }

        @keyframes flowDown {  
            0% { top: \-20px; opacity: 0; }  
            10% { opacity: 0.8; }  
            90% { opacity: 0.8; }  
            100% { top: 100%; opacity: 0; }  
        }

        /\* Output indicators \*/  
        .output-220 {  
            position: absolute;  
            bottom: \-25px;  
            left: 50%;  
            transform: translateX(-50%);  
            background: \#3498db;  
            color: white;  
            padding: 3px 12px;  
            border-radius: 4px;  
            font-size: 10px;  
            font-weight: 600;  
            letter-spacing: 0.5px;  
        }  
    \</style\>  
\</head\>  
\<body\>  
    \<div class="container"\>  
        \<\!-- Title removed \--\>

        \<\!-- 500kV Bus Lines \--\>  
        \<div class="bus-line bus-1"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 2s;"\>\</div\>  
        \</div\>  
        \<div class="bus-line bus-2"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 0.5s;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 2.5s;"\>\</div\>  
        \</div\>  
        \<div class="bus-line bus-3"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 1s;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 3s;"\>\</div\>  
        \</div\>  
        \<div class="bus-line bus-4"\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 1.5s;"\>\</div\>  
            \<div class="power-dot" style="animation: moveDot 4s linear infinite 3.5s;"\>\</div\>  
        \</div\>

        \<\!-- Voltage Labels \--\>  
        \<div class="voltage-label" style="top: 88px; left: 20px;"\>500kV LINE 01\</div\>  
        \<div class="voltage-label" style="top: 138px; left: 20px;"\>500kV LINE 02\</div\>  
        \<div class="voltage-label" style="top: 188px; left: 20px;"\>500kV LINE 03\</div\>  
        \<div class="voltage-label" style="top: 238px; left: 20px;"\>500kV LINE 04\</div\>

        \<\!-- Connection Points \- Fixed position \--\>  
        \<div class="connection-point connection-left"\>\</div\>  
        \<div class="connection-point connection-right"\>\</div\>

        \<\!-- Vertical Lines \- Aligned with connection points \--\>  
        \<div class="vertical-line vert-1"\>\</div\>  
        \<div class="vertical-line vert-2"\>\</div\>

        \<\!-- Substation Groups \--\>  
        \<div class="substation-group" id="sub-group-1"\>  
            \<div class="substation"\>  
                \<div class="substation-title"\>SUBSTATION 01\</div\>  
                \<div class="substation-voltage"\>500/220kV\</div\>  
                \<div class="substation-capacity"\>2 x 600MVA\</div\>  
                \<div class="output-220"\>220kV OUT\</div\>  
            \</div\>  
        \</div\>

        \<div class="substation-group" id="sub-group-2"\>  
            \<div class="substation"\>  
                \<div class="substation-title"\>SUBSTATION 02\</div\>  
                \<div class="substation-voltage"\>500/220kV\</div\>  
                \<div class="substation-capacity"\>2 x 600MVA\</div\>  
                \<div class="output-220"\>220kV OUT\</div\>  
            \</div\>  
        \</div\>

        \<\!-- 220kV Distribution \--\>  
        \<div class="distribution-220"\>\</div\>

        \<\!-- Vertical drops \--\>  
        \<div class="drop-line drop-1"\>  
            \<div class="flow-particle" style="animation: flowDown 2s linear infinite;"\>\</div\>  
        \</div\>  
        \<div class="drop-line drop-2"\>  
            \<div class="flow-particle" style="animation: flowDown 2s linear infinite 0.7s;"\>\</div\>  
        \</div\>  
        \<div class="drop-line drop-3"\>  
            \<div class="flow-particle" style="animation: flowDown 2s linear infinite 1.4s;"\>\</div\>  
        \</div\>

        \<\!-- Data Centers \--\>  
        \<div class="datacenter-container"\>  
            \<div class="datacenter"\>  
                \<div class="datacenter-name"\>DATA CENTER 01\</div\>  
                \<div class="datacenter-power"\>100MW\</div\>  
                \<div class="datacenter-voltage"\>22kV\</div\>  
            \</div\>  
            \<div class="datacenter"\>  
                \<div class="datacenter-name"\>DATA CENTER 02\</div\>  
                \<div class="datacenter-power"\>100MW\</div\>  
                \<div class="datacenter-voltage"\>22kV\</div\>  
            \</div\>  
            \<div class="datacenter"\>  
                \<div class="datacenter-name"\>DATA CENTER 03\</div\>  
                \<div class="datacenter-power"\>100MW\</div\>  
                \<div class="datacenter-voltage"\>22kV\</div\>  
            \</div\>  
        \</div\>  
    \</div\>

    \<script\>  
        // Animate power values  
        setInterval(() \=\> {  
            const powers \= document.querySelectorAll('.datacenter-power');  
            powers.forEach(power \=\> {  
                const base \= 100;  
                const variation \= Math.floor(Math.random() \* 3 \- 1);  
                power.textContent \= (base \+ variation) \+ 'MW';  
            });  
        }, 3000);

        // Connection point pulse  
        const connPoints \= document.querySelectorAll('.connection-point');  
        setInterval(() \=\> {  
            connPoints.forEach(point \=\> {  
                point.style.transform \= point.classList.contains('connection-left') ?   
                    'translateX(-50%) scale(1.2)' : 'translateX(50%) scale(1.2)';  
                setTimeout(() \=\> {  
                    point.style.transform \= point.classList.contains('connection-left') ?   
                        'translateX(-50%) scale(1)' : 'translateX(50%) scale(1)';  
                }, 500);  
            });  
        }, 2000);  
    \</script\>  
\</body\>  
\</html\>  
(-50%) scale(1)' : 'translateX(50%) scale(1)';  
                }, 500);  
            });  
        }, 2000);  
    \</script\>  
\</body\>  
\</html\>  
