using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public enum CertaintyLevel
    {
        [EnumMember(Value = "0")]
        None,
        [EnumMember(Value = "1")]
        NoIdea,
        [EnumMember(Value = "3")]
        EstimationBad,
        [EnumMember(Value = "4")]
        EstimationMedium,
        [EnumMember(Value = "5")]
        EstimationGood,
        [EnumMember(Value = "7")]
        Confident,
        [EnumMember(Value = "9")]
        SetInStone
    }

    [DataContract]
    public class DataParticle : INotifyPropertyChanged
    {
        #region INotifyPropertyChanged
        public event PropertyChangedEventHandler PropertyChanged;

        private void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        #endregion

        #region Serialization
        [DataMember]
        public CertaintyLevel _CL
        {
            get { return certainty; }
            set { certainty = value; }
        }
    #endregion

        protected CertaintyLevel certainty;

        #region Accessors
        public CertaintyLevel Certainty
        {
            get { return certainty; }
            set
            {
                if (certainty != value)
                {
                    certainty = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public DataParticle()
        {

        }
    }

    //Objects without a history
    [DataContract]
    public class DataObject : DataParticle, INotifyPropertyChanged
    {
        public static readonly int ID_INVALID = -1;

        protected virtual int GetNEXTID()
        {
            return ID_INVALID;
        }

        protected virtual void SetNEXTID(int id)
        {

        }

        private void UpdateNEXTID()
        {
            SetNEXTID(Math.Max(id + 1, GetNEXTID()));
        }

        #region INotifyPropertyChanged
        public event PropertyChangedEventHandler PropertyChanged;

        private void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        #endregion

        #region Serialization
        [DataMember]
        public int _ID
        {
            get { return id; }
            set { id = value; UpdateNEXTID(); } //Deserialization should update NEXT_ID
        }
        #endregion

        protected int id = ID_INVALID;

        #region Accessors
        public int ID
        {
            get { return id; }
            set
            {
                if (id != value)
                {
                    id = value;
                    UpdateNEXTID();
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion
        
        public static implicit operator int(DataObject obj)
        {
            return obj.id;
        }

        public DataObject() : base()
        {

        }

        public DataObject(bool claimID)
        {
            if (claimID)
            {
                ID = GetNEXTID();
            }
        }
    }

    //Plain old data
    [DataContract(Name = "DP_{0}")]
    public class DataPiece<T> : DataParticle
    {
        #region Serialization
        [DataMember]
        public DateTime _TS
        {
            get { return timestamp; }
            set { timestamp = value; }
        }
        [DataMember]
        public List<DataPiece<T>> _H
        {
            get { return history; }
            set { history = value; }
        }
        [DataMember]
        public T _V
        {
            get { return _value; }
            set { _value = value; }
        }
        #endregion

        protected DateTime timestamp;
        protected List<DataPiece<T>> history = new List<DataPiece<T>>();
        protected T _value;

        #region Accessors
        public T Value
        {
            get
            {
                return _value;
            }
            set
            {
                //Create copy in history
                //I would love to constrain T to IClonable which would be the crappy C# like solution but some types that I need don't implement it
                //so I have to rely on the types to be structs or have their data content flagged mutable. *sigh*
                DataPiece<T> copy = new DataPiece<T>();
                copy.timestamp = timestamp;
                copy._value = _value;
                history.Add(copy);

                timestamp = DateTime.Now;
                _value = value;
            }
        }
        #endregion

        public DataPiece() : base()
        {
            timestamp = DateTime.Now;
        }

        public DataPiece(T initValue) : this()
        {
            _value = initValue;
        }

        //Bypasses creation of history entry
        //I would love to overwrite the assignment operator so that I don't need this shit but its fucking impossible
        public void Init(T value)
        {
            timestamp = DateTime.Now;
            _value = value;
        }

        public static implicit operator T(DataPiece<T> obj)
        {
            return obj.Value;
        }
    }

    [DataContract]
    public class Date : DataPiece<DateTime>, INotifyPropertyChanged
    {
        #region INotifyPropertyChanged
        public event PropertyChangedEventHandler PropertyChanged;

        private void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        #endregion

        #region Serialization
        [DataMember]
        public bool _Y
        {
            get { return yearDefined; }
            set { yearDefined = value; }
        }
        [DataMember]
        public bool _M
        {
            get { return monthDefined; }
            set { monthDefined = value; }
        }
        [DataMember]
        public bool _D
        {
            get { return dayDefined; }
            set { dayDefined = value; }
        }
        #endregion

        public const int VALUE_INVALID = 0;
        protected const int VALUE_UNDEFINED = 1;
        protected const int VALUE_UNDEFINED_YEAR = 2000;

        protected bool yearDefined = false;
        protected bool monthDefined = false;
        protected bool dayDefined = false;

        #region Accessors
        public bool YearDefined
        {
            get { return yearDefined; }
            set
            {
                if (yearDefined != value)
                {
                    yearDefined = value;
                    if (!yearDefined)
                    {
                        MonthDefined = false;
                    }
                    NotifyPropertyChanged();
                }
            }
        }

        public bool MonthDefined
        {
            get { return monthDefined; }
            set
            {
                if (monthDefined != value)
                {
                    monthDefined = value;
                    if (monthDefined)
                    {
                        YearDefined = true;
                    }
                    else
                    {
                        DayDefined = false;
                    }
                    NotifyPropertyChanged();
                }
            }
        }

        public bool DayDefined
        {
            get { return dayDefined; }
            set
            {
                if (dayDefined != value)
                {
                    dayDefined = value;
                    if (dayDefined)
                    {
                        MonthDefined = true;
                    }
                    NotifyPropertyChanged();
                }
            }
        }

        #region All/NoneDefined
        public bool AllDefined
        {
            get
            {
                return dayDefined && monthDefined && yearDefined;
            }
            set
            {
                if (value == true && !AllDefined)
                {
                    DayDefined = true;
                    MonthDefined = true;
                    YearDefined = true;
                    NotifyPropertyChanged();
                }
            }
        }

        public bool NoneDefined
        {
            get
            {
                return !dayDefined && !monthDefined && !yearDefined;
            }
            set
            {
                if (value == true && !NoneDefined)
                {
                    DayDefined = false;
                    MonthDefined = false;
                    YearDefined = false;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public int Year
        {
            get { return yearDefined ? Value.Year : VALUE_UNDEFINED_YEAR; }
            set
            {
                if (Value.Year != value)
                {
                    Value = Value.AddYears(value - Value.Year);
                    yearDefined = true;
                    NotifyPropertyChanged();
                }
            }
        }

        public int Month
        {
            get { return monthDefined ? Value.Month : VALUE_UNDEFINED; }
            set
            {
                if (Value.Month != value)
                {
                    Value = Value.AddMonths(value - Value.Month);
                    monthDefined = true;
                    NotifyPropertyChanged();
                }
            }
        }

        public int Day
        {
            get { return dayDefined ? Value.Day : VALUE_UNDEFINED; }
            set
            {
                if (Value.Day != value)
                {
                    Value = Value.AddDays(value - Value.Day);
                    dayDefined = true;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public void Set(int year = VALUE_INVALID, int month = VALUE_INVALID, int day = VALUE_INVALID)
        {
            if (year != VALUE_INVALID)
            {
                Year = year;
            }
            if (month != VALUE_INVALID)
            {
                Month = month;
            }
            if (day != VALUE_INVALID)
            {
                Day = day;
            }
        }
        
        public Date()
        {
            Value = Value.AddYears(VALUE_UNDEFINED_YEAR - Value.Year);
        }
    }

    [DataContract]
    public class String : DataPiece<string>
    {
        public String() : base()
        {
            _value = "";
        }
    }
}
