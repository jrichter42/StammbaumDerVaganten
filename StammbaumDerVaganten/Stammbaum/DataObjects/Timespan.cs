using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Timespan
    {
        #region Serialization
        [DataMember]
        public int _SP
        {
            get { return startTimepoint; }
            set { startTimepoint = value; }
        }
        [DataMember]
        public int _EP
        {
            get { return endTimepoint; }
            set { endTimepoint = value; }
        }
        [DataMember]
        public Date _S
        {
            get { return start; }
            set { start = value; }
        }
        [DataMember]
        public Date _E
        {
            get { return end; }
            set { end = value; }
        }
        #endregion

        protected int startTimepoint = Timepoint.ID_INVALID;
        protected int endTimepoint = Timepoint.ID_INVALID;

        protected Date start = new Date();
        protected Date end = new Date();

        #region Accessors
        public int StartTimepoint
        {
            get { return startTimepoint; }
            set { startTimepoint = value; }
        }

        public int EndTimepoint
        {
            get { return endTimepoint; }
            set { endTimepoint = value; }
        }
        #endregion

        #region Date abstraction
        public bool StartIsCustom()
        {
            return startTimepoint == Timepoint.ID_INVALID;
        }

        public bool EndIsCustom()
        {
            return endTimepoint == Timepoint.ID_INVALID;
        }

        public Date Start
        {
            get
            {
                if (!StartIsCustom())
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(startTimepoint);
                        if (tp != null)
                        {
                            return tp.Date;
                        }
                    }
                }
                return start;
            }
            set
            {
                if (!StartIsCustom())
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(startTimepoint);
                        if (tp != null)
                        {
                            if (tp.Date != value)
                            {
                                tp.Date = value;
                            }
                        }
                    }
                }
                start = value;
            }
        }

        public Date End
        {
            get
            {
                if (!EndIsCustom())
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(endTimepoint);
                        if (tp != null)
                        {
                            return tp.Date;
                        }
                    }
                }
                return end;
            }
            set
            {
                if (!EndIsCustom())
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(endTimepoint);
                        if (tp != null)
                        {
                            if (tp.Date != value)
                            {
                                tp.Date = value;
                            }
                        }
                    }
                }
                end = value;
            }
        }
        #endregion

        public Timespan() : base()
        {

        }
    }
}
