const COUNTY_URL="https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";
const EDUCATION_URL="https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";

const w=960;
const h=650;

window.onload=()=>{
  const svg=d3.select("#svg-container").append("svg").attr("width",w).attr("height",h);

  const tips=d3.select("body")
                .append("div")
                .attr("id", "tips")
                .style("left","-10000px");
  tips.append("text").attr("id", "tips-text");

  const path=d3.geoPath();
  
  const promises=[];
  promises.push(d3.json(COUNTY_URL));
  promises.push(d3.json(EDUCATION_URL));
  Promise.all(promises).then(datas=>{
    const countyData=datas[0];
    const educationData=datas[1];
    const bachelorsOrHighers=educationData.map(item=>item.bachelorsOrHigher);

    const minEducation=d3.min(bachelorsOrHighers);
    const maxEducation=d3.max(bachelorsOrHighers);
    const thresholds=[];
    for(let i=0;i<8;++i){
      thresholds.push(minEducation+(maxEducation-minEducation)*i/8);
    }
    thresholds.push(maxEducation);
    const colorScale=d3.scaleLinear().domain([minEducation,maxEducation]).range([0,1]);
    svg.selectAll("path")
        .data(topojson.feature(countyData, countyData.objects.counties).features)
        .enter()
        .append("path")
        .attr("fill", d=>{
          let result = educationData.filter(o=>o.fips==d.id);
          return d3.interpolateGreens(colorScale(result[0].bachelorsOrHigher));
        })
        .attr("d", path)
        .on("mouseover", d=>{
          let result = educationData.filter(o=>o.fips==d.id);
          d3.select("#tips-text")
            .text(`${result[0].area_name}, ${result[0].state}: ${result[0].bachelorsOrHigher}%`);
          tips.style("top",`${d3.event.pageY-20}px`);
          tips.style("left",`${d3.event.pageX}px`);
        })
        .on("mouseout",()=>{
          tips.style("left","-10000px");
        });
  });
};



