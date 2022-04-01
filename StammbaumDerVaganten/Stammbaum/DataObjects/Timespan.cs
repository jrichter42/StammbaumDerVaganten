using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Timespan
    {
        [DataMember(Name = "_SP")]
        public VersionedData<Reference<Timepoint>> StartTimepointRef { get; set; } = new VersionedData<Reference<Timepoint>>();
        [DataMember(Name = "_EP")]
        public VersionedData<Reference<Timepoint>> EndTimepointRef { get; set; } = new VersionedData<Reference<Timepoint>>();

        [DataMember(Name = "_S")]
        protected VersionedData<Date> customStart = new VersionedData<Date>();
        [DataMember(Name = "_E")]
        protected VersionedData<Date> customEnd = new VersionedData<Date>();

        #region Date abstraction
        public bool StartIsCustom()
        {
            return !StartTimepointRef.Latest.IsValid();
        }

        public bool EndIsCustom()
        {
            return !EndTimepointRef.Latest.IsValid();
        }

        public Date Start
        {
            get
            {
                if (!StartIsCustom())
                {
                    Data data = MainViewmodel.ActiveData;
                    if (data is not null)
                    {
                        Timepoint tp = data.GetObjectFromReference(StartTimepointRef);
                        if (tp is not null)
                        {
                            return tp.Date;
                        }
                    }
                }
                return customStart;
            }
            set
            {
                if (!StartIsCustom())
                {
                    Data data = MainViewmodel.ActiveData;
                    if (data is not null)
                    {
                        Timepoint tp = data.GetObjectFromReference(StartTimepointRef);
                        if (tp is not null)
                        {
                            if (tp.Date.Latest != value)
                            {
                                tp.Date.Latest = value;
                            }
                        }
                    }
                }
                customStart.Latest = value;
            }
        }

        public Date End
        {
            get
            {
                if (!EndIsCustom())
                {
                    Data data = MainViewmodel.ActiveData;
                    if (data is not null)
                    {
                        Timepoint tp = data.GetObjectFromReference(EndTimepointRef);
                        if (tp is not null)
                        {
                            return tp.Date;
                        }
                    }
                }
                return customEnd;
            }
            set
            {
                if (!EndIsCustom())
                {
                    Data data = MainViewmodel.ActiveData;
                    if (data is not null)
                    {
                        Timepoint tp = data.GetObjectFromReference(EndTimepointRef);
                        if (tp is not null)
                        {
                            if (tp.Date.Latest != value)
                            {
                                tp.Date.Latest = value;
                            }
                        }
                    }
                }
                customEnd.Latest = value;
            }
        }
        #endregion

        public Timespan()
        { }

        public Timespan(Reference<Timepoint> startTimepointRef, Reference<Timepoint> endTimepointRef)
        {
            StartTimepointRef.OverwriteLatestValue(startTimepointRef);
            EndTimepointRef.OverwriteLatestValue(endTimepointRef);
        }

        public Timespan(Reference<Timepoint> startTimepointRef, Date _customEnd)
        {
            StartTimepointRef.OverwriteLatestValue(startTimepointRef);
            customEnd.OverwriteLatestValue(_customEnd);
        }

        public Timespan(Date _customStart, Reference<Timepoint> endTimepointRef)
        {
            customStart.OverwriteLatestValue(_customStart);
            EndTimepointRef.OverwriteLatestValue(endTimepointRef);
        }

        public Timespan(Date _customStart, Date _customEnd)
        {
            customStart.OverwriteLatestValue(_customStart);
            customEnd.OverwriteLatestValue(_customEnd);
        }

        // AFAIK, C# doesn't provide a nice equivalent to cpp's variant
        /*protected Timespan(Reference<Timepoint> startTimepointRef, Date _customStart, Reference<Timepoint> endTimepointRef, Date _customEnd)
        {
            StartTimepointRef.OverwriteLatestValue(startTimepointRef);
            customStart.OverwriteLatestValue(_customStart);
            EndTimepointRef.OverwriteLatestValue(endTimepointRef);
            customEnd.OverwriteLatestValue(_customEnd);
        }*/

        public override string ToString()
        {
            return "Implement Timespan.ToString()";
        }
    }
}
