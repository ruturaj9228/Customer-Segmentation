from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import io
import base64
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        # Identify numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        # Take a preview (first 5 rows)
        preview = df.head().fillna("").to_dict(orient='records')
        
        return {
            "columns": df.columns.tolist(),
            "numericColumns": numeric_cols,
            "preview": preview
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cluster")
async def cluster_data(
    file: UploadFile = File(...),
    features: str = Form(...), # JSON encoded list of strings
    k: int = Form(...)
):
    try:
        # 1. Read & parse inputs
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        feature_cols = json.loads(features)
        
        if not feature_cols:
            raise HTTPException(status_code=400, detail="No features selected for clustering.")
        if k < 2:
            raise HTTPException(status_code=400, detail="Number of clusters (k) must be at least 2.")
            
        missing_cols = [col for col in feature_cols if col not in df.columns]
        if missing_cols:
            raise HTTPException(status_code=400, detail=f"Missing columns in dataset: {missing_cols}")
            
        # 2. Extract and sanitize feature data
        X_raw = df[feature_cols].copy()
        
        # Handle simple NaNs by dropping those rows from our clustering or filling them.
        # For simplicity, let's fill NaNs with median of each column.
        X_raw = X_raw.fillna(X_raw.median())
        
        # 3. Scaling
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_raw)
        
        # 4. KMeans Clustering
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(X_scaled)
        
        # Add Cluster labels to the original dataframe
        df["Cluster"] = clusters
        
        # Calculate overall dataset means for dynamic thresholds
        dataset_means = X_raw.mean().to_dict()
        
        # Calculate Insights: Group by Cluster and calculate the mean of selected features
        df_insights = df.groupby("Cluster")[feature_cols].mean().round(2).to_dict(orient="index")
        
        # Heuristics to find income and spending columns
        income_col = None
        spending_col = None
        
        income_keywords = ['income', 'salary', 'earning', 'wage', 'revenue']
        spending_keywords = ['spend', 'score', 'purchase', 'buy', 'paid']
        
        for col in feature_cols:
            col_lower = col.lower()
            if not income_col and any(kw in col_lower for kw in income_keywords):
                income_col = col
            if not spending_col and any(kw in col_lower for kw in spending_keywords):
                spending_col = col
                
        # Fallback to first two columns if specific keywords aren't found
        # but only if we have at least 2 columns
        if len(feature_cols) >= 2:
            if not income_col:
                income_col = next((c for c in feature_cols if c != spending_col), feature_cols[0])
            if not spending_col:
                spending_col = next((c for c in feature_cols if c != income_col), feature_cols[1])
        
        has_keywords = income_col and spending_col and \
                       any(kw in income_col.lower() for kw in income_keywords) and \
                       any(kw in spending_col.lower() for kw in spending_keywords)
        
        insights = []
        for cluster_id, means in df_insights.items():
            count = int((df["Cluster"] == cluster_id).sum())
            label = f"Group {cluster_id}"
            description = "A standard customer segment."
            
            if income_col and spending_col:
                # Dynamic thresholds based on dataset average
                income_mean = dataset_means[income_col]
                spending_mean = dataset_means[spending_col]
                
                is_high_income = means[income_col] >= income_mean
                is_high_spending = means[spending_col] >= spending_mean
                               
                if is_high_income and is_high_spending:
                    label = "Premium Customers 💎" if has_keywords else "High Performers 💎"
                    description = f"Higher than average {income_col} and {spending_col}."
                elif is_high_income and not is_high_spending:
                    label = "Careful Customers 🧠" if has_keywords else "Conservative Users 🧠"
                    description = f"Higher {income_col} but lower {spending_col}."
                elif not is_high_income and is_high_spending:
                    label = "Impulse Buyers 🎯" if has_keywords else "Active Users 🎯"
                    description = f"Lower {income_col} but higher {spending_col}."
                else:
                    label = "Low Value Customers 📉" if has_keywords else "Standard Users 📉"
                    description = f"Lower than average {income_col} and {spending_col}."
            elif len(feature_cols) == 1:
                col = feature_cols[0]
                is_high = means[col] >= dataset_means[col]
                label = f"High {col} 📈" if is_high else f"Low {col} 📉"
                description = f"Customers with {'above' if is_high else 'below'} average {col}."
                
            insights.append({
                "cluster": int(cluster_id),
                "label": label,
                "description": description,
                "count": count,
                "means": means
            })
            
        # 5. Dimensionality Reduction to 2D for UI Scatter Plot
        # We enforce 2 dimensions for visual plotting using PCA
        if len(feature_cols) > 2:
            pca = PCA(n_components=2)
            X_2d = pca.fit_transform(X_scaled)
            centroids_2d = pca.transform(kmeans.cluster_centers_)
            x_label = "PCA Component 1"
            y_label = "PCA Component 2"
        elif len(feature_cols) == 2:
            X_2d = X_scaled
            centroids_2d = kmeans.cluster_centers_
            x_label = f"{feature_cols[0]} (Scaled)"
            y_label = f"{feature_cols[1]} (Scaled)"
        else:
            # Only 1 feature selected, we plot it against 0 or an index.
            X_2d = np.column_stack((X_scaled, np.zeros_like(X_scaled)))
            centroids_2d = np.column_stack((kmeans.cluster_centers_, np.zeros_like(kmeans.cluster_centers_)))
            x_label = f"{feature_cols[0]} (Scaled)"
            y_label = "Zero reference"
            
        # Compile Plot Points
        plot_points = []
        for i in range(len(X_2d)):
            plot_points.append({
                "x": float(X_2d[i, 0]),
                "y": float(X_2d[i, 1]),
                "cluster": int(clusters[i]),
                "tooltip": df.iloc[i].fillna("").to_dict() # Entire row as dict for tooltip
            })
            
        # Compile Centroids
        centroids = []
        for i in range(len(centroids_2d)):
            centroids.append({
                "x": float(centroids_2d[i, 0]),
                "y": float(centroids_2d[i, 1]),
                "cluster": i
            })

        # 6. Generate Downloadable CSV with labels
        # Create a mapping from cluster ID to generated human-readable label
        cluster_label_map = {item["cluster"]: item["label"] for item in insights}
        
        # Apply mapping to create a new textual label column
        df["Cluster_Label"] = df["Cluster"].map(cluster_label_map)
        
        # Drop the raw numeric 'Cluster' column for a cleaner output, 
        # keeping only the meaningful 'Cluster_Label'
        df_csv = df.drop(columns=["Cluster"])
        
        csv_buffer = io.StringIO()
        df_csv.to_csv(csv_buffer, index=False)
        encoded_csv = base64.b64encode(csv_buffer.getvalue().encode('utf-8')).decode('utf-8')
        
        # 7. Generate Individual Cluster Data (Rows & specific CSVs)
        cluster_data = {}
        for cluster_id in range(k):
            # Safe text coercion for dictionary keys
            cid_str = str(cluster_id)
            # Filter the dataframe for this specific cluster
            cluster_df = df_csv[df["Cluster"] == cluster_id]
            
            # Keep top 100 rows for preview to prevent massive payload sizes
            preview_rows = cluster_df.head(100).fillna("").to_dict(orient='records')
            
            # Generate the isolated CSV base64 just for this segment
            c_csv_buffer = io.StringIO()
            cluster_df.to_csv(c_csv_buffer, index=False)
            c_encoded_csv = base64.b64encode(c_csv_buffer.getvalue().encode('utf-8')).decode('utf-8')
            
            cluster_data[cid_str] = {
                "rows": preview_rows,
                "csv": c_encoded_csv
            }
        
        return {
            "plotData": {
                "points": plot_points,
                "centroids": centroids,
                "xLabel": x_label,
                "yLabel": y_label
            },
            "insights": insights,
            "downloadCSV_base64": encoded_csv,
            "clusterData": cluster_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
