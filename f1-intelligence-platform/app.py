import streamlit as st

st.set_page_config(
    page_title="F1 Intelligence Platform",
    page_icon="🏎️",
    layout="wide"
)

# Sidebar
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1.svg/500px-F1.svg.png", width=120)
    st.title("🏎️ F1 Intelligence")
    st.markdown("---")
    st.markdown("### 📌 Modules")
    st.markdown("- 🏆 Season Standings")
    st.markdown("- 🔴 Tyre Strategy")
    st.markdown("- ⏱️ Pit Stop Analysis")
    st.markdown("- 👥 Driver Comparator")
    st.markdown("- 🚨 Anomaly Detector")
    st.markdown("- 🤖 Race Predictor")
    st.markdown("---")
    st.caption("Built with FastF1 + Streamlit")

# Home page
st.title("🏎️ F1 Intelligence Platform")
st.markdown("### The ultimate Formula 1 data analytics platform")
st.markdown("---")

col1, col2, col3 = st.columns(3)

with col1:
    st.info("📊 **Data Analysis**\n\nTyre strategy, pit stops, driver comparisons")

with col2:
    st.info("⚙️ **Data Engineering**\n\nETL pipeline, data validation, quality checks")

with col3:
    st.info("🤖 **Machine Learning**\n\nRace outcome predictor, anomaly detection")

st.markdown("---")
st.markdown("### 🚀 Select a module from the sidebar to get started!")

# Quick stats
st.markdown("### 📊 F1 By The Numbers")
s1, s2, s3, s4 = st.columns(4)
with s1:
    st.metric("🏁 Seasons", "74")
with s2:
    st.metric("🏎️ Drivers", "800+")
with s3:
    st.metric("🏆 Constructors", "210+")
with s4:
    st.metric("🌍 Circuits", "77+")